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

type Filters = {
  search: string;
  type: "" | EquipmentType;
  status: "" | EquipmentStatus;
};

type FormData = {
  name: string;
  type: EquipmentType;
  acquisitionDate: string;
  status: EquipmentStatus;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const INITIAL_FORM: FormData = {
  name: "",
  type: "MONITOR",
  acquisitionDate: "",
  status: "ATIVO",
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
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
    status: "",
  });
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.set("search", filters.search.trim());
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);

    const query = params.toString();
    return query ? `?${query}` : "";
  }, [filters]);

  const loadEquipments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/equipments${queryString}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel carregar os equipamentos.");
      }

      const data: Equipment[] = await response.json();
      setEquipments(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado ao carregar dados.",
      );
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadEquipments();
    }, 300);

    return () => clearTimeout(timeout);
  }, [loadEquipments]);

  function validateForm(values: FormData) {
    if (!values.name.trim()) {
      return "O nome do equipamento e obrigatorio.";
    }

    if (!values.acquisitionDate) {
      return "A data de aquisicao e obrigatoria.";
    }

    return "";
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
      const response = await fetch(`${API_BASE}/equipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
        }),
      });

      if (!response.ok) {
        const details = (await response.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;
        const reason =
          details?.message && Array.isArray(details.message)
            ? details.message.join(" | ")
            : typeof details?.message === "string"
              ? details.message
              : undefined;

        throw new Error(reason ?? "Falha ao cadastrar equipamento.");
      }

      setFormData(INITIAL_FORM);
      setFeedback("Equipamento cadastrado com sucesso.");
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
      const response = await fetch(`${API_BASE}/equipments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel remover o equipamento.");
      }

      setFeedback("Equipamento removido com sucesso.");
      await loadEquipments();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado ao remover item.",
      );
    }
  }

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />

      <main className="page-grid">
        <header className="hero-card fade-up">
          <span className="kicker">Teste Tecnico | UNICEPLAC</span>
          <h1>Sistema de Gerenciamento de Ativos de TI</h1>
          <p>
            Painel centralizado para registrar e acompanhar equipamentos de
            laboratorio com filtros por tipo e status.
          </p>
        </header>

        <section className="panel fade-up delay-1">
          <h2>Cadastrar equipamento</h2>
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
              {submitting ? "Salvando..." : "Cadastrar equipamento"}
            </button>
          </form>
        </section>

        <section className="panel fade-up delay-2">
          <div className="list-header">
            <h2>Dashboard de equipamentos</h2>
            <span>{equipments.length} item(ns)</span>
          </div>

          <div className="filter-grid">
            <input
              placeholder="Buscar por nome"
              value={filters.search}
              onChange={(event) =>
                setFilters((old) => ({ ...old, search: event.target.value }))
              }
            />

            <select
              value={filters.type}
              onChange={(event) =>
                setFilters((old) => ({
                  ...old,
                  type: event.target.value as Filters["type"],
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
                    onClick={() => void handleDelete(item._id)}
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
