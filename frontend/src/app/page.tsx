"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type EquipmentType = "MONITOR" | "CPU" | "TECLADO";
type EquipmentStatus = "ATIVO" | "MANUTENCAO";

type Equipment = {
  _id: string;
  name: string;
  type: EquipmentType;
  acquisitionDate: string;
  status: EquipmentStatus;
  createdAt: string;
  updatedAt: string;
};

type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN";
};

type SessionPayload = {
  user: SessionUser;
  csrfToken?: string;
};

type EquipmentListResponse = {
  data: Equipment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type SummaryResponse = {
  total: number;
  byStatus: {
    ativo: number;
    manutencao: number;
  };
  byType: {
    monitor: number;
    cpu: number;
    teclado: number;
  };
};

type Filters = {
  search: string;
  type: "" | EquipmentType;
  status: "" | EquipmentStatus;
  page: number;
  limit: number;
};

type FormData = {
  name: string;
  type: EquipmentType;
  acquisitionDate: string;
  status: EquipmentStatus;
};

type LoginForm = {
  email: string;
  password: string;
};

function resolveApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith(".onrender.com")) {
      return "https://sistema-ativos-uniceplac.onrender.com";
    }
  }

  return "http://localhost:3001";
}

const API_BASE = resolveApiBase();

const INITIAL_FORM: FormData = {
  name: "",
  type: "MONITOR",
  acquisitionDate: "",
  status: "ATIVO",
};

const INITIAL_LOGIN: LoginForm = {
  email: "admin@uniceplac.com",
  password: "",
};

const typeOptions: EquipmentType[] = ["MONITOR", "CPU", "TECLADO"];
const statusOptions: EquipmentStatus[] = ["ATIVO", "MANUTENCAO"];

function labelType(value: EquipmentType) {
  if (value === "MONITOR") return "Monitor";
  if (value === "CPU") return "CPU";
  return "Teclado";
}

function labelStatus(value: EquipmentStatus) {
  if (value === "ATIVO") return "Ativo";
  return "Manutencao";
}

export default function Home() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loginForm, setLoginForm] = useState<LoginForm>(INITIAL_LOGIN);
  const [loginSubmitting, setLoginSubmitting] = useState<boolean>(false);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
    status: "",
    page: 1,
    limit: 10,
  });
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [meta, setMeta] = useState<EquipmentListResponse["meta"]>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");

  const queryWithoutPagination = useMemo(() => {
    const params = new URLSearchParams();
    const search = filters.search.trim();

    if (search.length >= 2) params.set("search", search);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);

    return params.toString();
  }, [filters.search, filters.status, filters.type]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    const baseQuery = queryWithoutPagination;

    if (baseQuery) {
      const parsed = new URLSearchParams(baseQuery);
      parsed.forEach((value, key) => params.set(key, value));
    }

    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    const query = params.toString();
    return query ? `?${query}` : "";
  }, [filters.limit, filters.page, queryWithoutPagination]);

  const request = useCallback(async <T,>(path: string, init?: RequestInit) => {
    const method = (init?.method ?? "GET").toUpperCase();
    const isBodyFormData = init?.body instanceof FormData;
    const needsCsrf =
      ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
      path !== "/auth/login";

    const headers = {
      ...(isBodyFormData ? {} : { "Content-Type": "application/json" }),
      ...(needsCsrf
        ? (() => {
            if (!csrfToken) {
              throw new Error(
                "Token CSRF ausente. Recarregue a pagina e faca login novamente.",
              );
            }

            return { "x-csrf-token": csrfToken };
          })()
        : {}),
      ...(init?.headers ?? {}),
    };

    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });

    if (response.status === 401) {
      setSession(null);
      setCsrfToken("");
      throw new Error("Sessao expirada. Faca login novamente.");
    }

    if (!response.ok) {
      const details = (await response.json().catch(() => null)) as
        | { message?: string | string[] }
        | null;

      const reason =
        details?.message && Array.isArray(details.message)
          ? details.message.join(" | ")
          : typeof details?.message === "string"
            ? details.message
            : "Erro inesperado na requisicao.";

      throw new Error(reason);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  }, [csrfToken]);

  const fetchSummary = useCallback(async () => {
    const data = await request<SummaryResponse>("/reports/equipments/summary");
    setSummary(data);
  }, [request]);

  const loadEquipments = useCallback(async () => {
    setLoading(true);

    try {
      const payload = await request<EquipmentListResponse>(
        `/equipments${queryString}`,
      );
      setEquipments(payload.data);
      setMeta(payload.meta);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado ao carregar dados.",
      );
      setEquipments([]);
      setMeta((old) => ({ ...old, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [queryString, request]);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        setSession(null);
        return;
      }

      const payload = (await response.json()) as SessionPayload;
      setSession(payload.user);
      setCsrfToken(payload.csrfToken ?? "");
    } catch {
      setSession(null);
      setCsrfToken("");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!session) return;

    const timeout = setTimeout(() => {
      void loadEquipments();
    }, 300);

    return () => clearTimeout(timeout);
  }, [loadEquipments, session]);

  useEffect(() => {
    if (!session) return;

    void fetchSummary();
  }, [fetchSummary, session]);

  function validateForm(values: FormData) {
    if (!values.name.trim()) {
      return "O nome do equipamento e obrigatorio.";
    }

    if (!values.acquisitionDate) {
      return "A data de aquisicao e obrigatoria.";
    }

    return "";
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginSubmitting(true);
    setError("");
    setFeedback("");

    try {
      const payload = await request<SessionPayload>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });

      setSession(payload.user);
  setCsrfToken(payload.csrfToken ?? "");
      setLoginForm((old) => ({ ...old, password: "" }));
      setFeedback("Login realizado com sucesso.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Falha ao realizar login.",
      );
    } finally {
      setLoginSubmitting(false);
    }
  }

  async function handleLogout() {
    setError("");
    setFeedback("");

    try {
      await request<{ message: string }>("/auth/logout", {
        method: "POST",
      });
      setSession(null);
      setCsrfToken("");
      setEquipments([]);
      setSummary(null);
      setFeedback("Logout realizado.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Falha ao sair.",
      );
    }
  }

  async function handleCreateEquipment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
      };

      if (editingId) {
        await request<Equipment>(`/equipments/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setFeedback("Equipamento atualizado com sucesso.");
      } else {
        await request<Equipment>("/equipments", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setFeedback("Equipamento cadastrado com sucesso.");
      }

      setFormData(INITIAL_FORM);
      setEditingId(null);
      await fetchSummary();
      await loadEquipments();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado no cadastro.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setFeedback("");
    setError("");

    try {
      await request<null>(`/equipments/${id}`, {
        method: "DELETE",
      });

      setFeedback("Equipamento removido com sucesso.");
      await fetchSummary();
      await loadEquipments();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado ao remover item.",
      );
    }
  }

  function startEdit(item: Equipment) {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      type: item.type,
      status: item.status,
      acquisitionDate: item.acquisitionDate.slice(0, 10),
    });
  }

  async function handleExport(format: "json" | "csv") {
    setExporting(format);
    setError("");

    try {
      const params = new URLSearchParams(queryWithoutPagination);
      params.set("format", format);

      const response = await fetch(
        `${API_BASE}/reports/equipments/export?${params.toString()}`,
        {
          credentials: "include",
        },
      );

      if (response.status === 401) {
        setSession(null);
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      if (!response.ok) {
        throw new Error("Falha ao exportar arquivo.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const extension = format === "json" ? "json" : "csv";

      anchor.href = url;
      anchor.download = `equipamentos-${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setFeedback(`Exportacao ${format.toUpperCase()} concluida.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Falha na exportacao.",
      );
    } finally {
      setExporting(null);
    }
  }

  if (authLoading) {
    return (
      <div className="app-shell centered-view">
        <p className="list-empty">Carregando sessao...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app-shell auth-view">
        <div className="background-orb background-orb-left" />
        <div className="background-orb background-orb-right" />

        <main className="login-card fade-up">
          <span className="kicker">UNICEPLAC | Area segura</span>
          <h1>Painel de Ativos de TI</h1>
          <p>
            Entre com credenciais administrativas para acessar os recursos de
            cadastro, relatorios e exportacao de dados.
          </p>
          <p className="login-hint">
            Use as credenciais configuradas em ADMIN_EMAIL e ADMIN_PASSWORD no
            backend.
          </p>

          <form className="form-grid" onSubmit={handleLogin}>
            <label>
              E-mail
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((old) => ({ ...old, email: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Senha
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((old) => ({
                    ...old,
                    password: event.target.value,
                  }))
                }
                required
                minLength={8}
              />
            </label>

            <button disabled={loginSubmitting} type="submit" className="primary-btn">
              {loginSubmitting ? "Entrando..." : "Acessar painel"}
            </button>
          </form>

          {error ? <p className="alert error">{error}</p> : null}
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />

      <main className="page-grid">
        <header className="hero-card fade-up">
          <span className="kicker">Teste Tecnico | UNICEPLAC</span>
          <h1>Plataforma Segura de Gerenciamento de Ativos</h1>
          <p>
            Controle completo de equipamentos de laboratorio com autenticacao,
            filtros inteligentes, paginacao e relatorios exportaveis.
          </p>
          <div className="hero-meta">
            <span>{session.email}</span>
            <button type="button" className="ghost-btn" onClick={() => void handleLogout()}>
              Sair
            </button>
          </div>
        </header>

        <section className="panel fade-up delay-1">
          <h2>Resumo operacional</h2>
          <div className="stats-grid">
            <article className="stat-card">
              <strong>{summary?.total ?? 0}</strong>
              <span>Total</span>
            </article>
            <article className="stat-card">
              <strong>{summary?.byStatus.ativo ?? 0}</strong>
              <span>Ativos</span>
            </article>
            <article className="stat-card">
              <strong>{summary?.byStatus.manutencao ?? 0}</strong>
              <span>Manutencao</span>
            </article>
            <article className="stat-card">
              <strong>{summary?.byType.monitor ?? 0}</strong>
              <span>Monitores</span>
            </article>
            <article className="stat-card">
              <strong>{summary?.byType.cpu ?? 0}</strong>
              <span>CPUs</span>
            </article>
            <article className="stat-card">
              <strong>{summary?.byType.teclado ?? 0}</strong>
              <span>Teclados</span>
            </article>
          </div>

          <div className="export-row">
            <button
              type="button"
              className="ghost-btn"
              disabled={exporting !== null}
              onClick={() => void handleExport("csv")}
            >
              {exporting === "csv" ? "Exportando..." : "Exportar CSV"}
            </button>
            <button
              type="button"
              className="ghost-btn"
              disabled={exporting !== null}
              onClick={() => void handleExport("json")}
            >
              {exporting === "json" ? "Exportando..." : "Exportar JSON"}
            </button>
          </div>
        </section>

        <section className="panel fade-up delay-2">
          <h2>{editingId ? "Editar equipamento" : "Cadastrar equipamento"}</h2>
          <form className="form-grid" onSubmit={handleCreateEquipment}>
            <label>
              Nome do equipamento
              <input
                value={formData.name}
                onChange={(event) =>
                  setFormData((old) => ({ ...old, name: event.target.value }))
                }
                placeholder="Ex.: Monitor Dell 24"
                required
              />
            </label>

            <div className="form-row">
              <label>
                Tipo
                <select
                  value={formData.type}
                  onChange={(event) =>
                    setFormData((old) => ({
                      ...old,
                      type: event.target.value as EquipmentType,
                    }))
                  }
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {labelType(type)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData((old) => ({
                      ...old,
                      status: event.target.value as EquipmentStatus,
                    }))
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {labelStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Data de aquisicao
              <input
                type="date"
                value={formData.acquisitionDate}
                onChange={(event) =>
                  setFormData((old) => ({
                    ...old,
                    acquisitionDate: event.target.value,
                  }))
                }
                required
              />
            </label>

            <button disabled={submitting} type="submit" className="primary-btn">
              {submitting
                ? "Salvando..."
                : editingId
                  ? "Salvar alteracoes"
                  : "Cadastrar equipamento"}
            </button>

            {editingId ? (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setEditingId(null);
                  setFormData(INITIAL_FORM);
                }}
              >
                Cancelar edicao
              </button>
            ) : null}
          </form>
        </section>

        <section className="panel fade-up delay-3">
          <div className="list-header">
            <h2>Dashboard de equipamentos</h2>
            <span>
              {meta.total} item(ns) | Pagina {meta.page} de {meta.totalPages}
            </span>
          </div>

          <div className="filter-grid">
            <input
              placeholder="Buscar por nome (minimo 2 letras)"
              value={filters.search}
              onChange={(event) =>
                setFilters((old) => ({
                  ...old,
                  search: event.target.value,
                  page: 1,
                }))
              }
            />

            <select
              value={filters.type}
              onChange={(event) =>
                setFilters((old) => ({
                  ...old,
                  type: event.target.value as Filters["type"],
                  page: 1,
                }))
              }
            >
              <option value="">Todos os tipos</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {labelType(type)}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((old) => ({
                  ...old,
                  status: event.target.value as Filters["status"],
                  page: 1,
                }))
              }
            >
              <option value="">Todos os status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {labelStatus(status)}
                </option>
              ))}
            </select>

            <select
              value={filters.limit}
              onChange={(event) =>
                setFilters((old) => ({
                  ...old,
                  page: 1,
                  limit: Number(event.target.value),
                }))
              }
            >
              {[10, 20, 30, 50].map((value) => (
                <option key={value} value={value}>
                  {value} por pagina
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="alert error">{error}</p> : null}
          {feedback ? <p className="alert success">{feedback}</p> : null}

          {loading ? (
            <p className="list-empty">Carregando equipamentos...</p>
          ) : equipments.length === 0 ? (
            <p className="list-empty">Nenhum equipamento encontrado.</p>
          ) : (
            <ul className="equipment-list">
              {equipments.map((item) => (
                <li key={item._id} className="equipment-card">
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {labelType(item.type)} | {labelStatus(item.status)}
                    </p>
                    <small>
                      Aquisicao: {new Date(item.acquisitionDate).toLocaleDateString("pt-BR")}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => startEdit(item)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ghost-btn danger-btn"
                    onClick={() => void handleDelete(item._id)}
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="pagination-row">
            <button
              type="button"
              className="ghost-btn"
              disabled={filters.page <= 1 || loading}
              onClick={() =>
                setFilters((old) => ({ ...old, page: Math.max(1, old.page - 1) }))
              }
            >
              Anterior
            </button>

            <span>
              Pagina {meta.page} de {meta.totalPages}
            </span>

            <button
              type="button"
              className="ghost-btn"
              disabled={filters.page >= meta.totalPages || loading}
              onClick={() =>
                setFilters((old) => ({
                  ...old,
                  page: Math.min(meta.totalPages, old.page + 1),
                }))
              }
            >
              Proxima
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
