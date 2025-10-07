import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useCitas } from '@/hooks/useCitas';
import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useClientes } from '@/hooks/useClientes';
import Icon from '@/components/Icons';
import toast from 'react-hot-toast';
import { generarPDFHistorial } from '@/components/utils/generarPDFHistorial';
import { useClienteServicio } from '@/hooks/useClienteServicio';
import { useServicioLabels } from '@/helpers/useServicioLabels';
import { estadoLabels, getEstadoColor, getMotivoColor, motivoLabels } from '@/helpers/colorHelper';

const ClientesPage = () => {
    const {
        clientes,
        loading: loadingClientes,
        addCliente,
        updateCliente,
        deleteCliente,
        refetch: refetchClientes,
    } = useClientes();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [formData, setFormData] = useState({ id: '', nombre: '', motivo: '', telefono: '' });
    const [clientesAleatorios, setClientesAleatorios] = useState([]);
    const [query, setQuery] = useState("");
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    const { servicios, asignarServicio, eliminarServicio } = useClienteServicio(selectedClient?.id);
    const { citas, loading, refetch } = useCitas(startDate, endDate);
    const { servicioLabels, getLabel } = useServicioLabels();
    const [showAddServicioModal, setShowAddServicioModal] = useState(false);
    const [nuevoServicio, setNuevoServicio] = useState("");
    const [servicioDetalle, setServicioDetalle] = useState(null);
    const [modoHistorial, setModoHistorial] = useState("resumen");



    const openAddService = (cliente) => {
        setSelectedClient(cliente);
        setNuevoServicio("");
        setShowAddServicioModal(true);
    };

    const openAddModal = () => {
        setFormData({ id: '', nombre: '', motivo: '', telefono: '' });
        setShowAddModal(true);
    };

    const openEditModal = (cliente) => {
        setSelectedClient(cliente);
        setFormData({ id: cliente.id, nombre: cliente.nombre, telefono: cliente.telefono, motivo: cliente.motivo });
        setShowEditModal(true);
    };

    const openDeleteModal = (cliente) => {
        setSelectedClient(cliente);
        setShowDeleteModal(true);
    };

    const openHistoryModal = (cliente) => {
        setSelectedClient(cliente);
        setShowHistoryModal(true);
    }

    const handleAddSubmit = async (e) => {
        e.preventDefault();

        const id = formData.id?.trim();
        const nombre = formData.nombre?.trim();
        const telefono = formData.telefono?.trim();
        const motivo = formData.motivo?.trim();

        if (!id || !nombre) {
            toast.error("Debes completar todos los campos");
            return;
        }

        if (!/^\d+$/.test(id)) {
            toast.error("El número de documento debe contener solo dígitos");
            return;
        }
        if (!/^\d+$/.test(telefono)) {
            toast.error("El número de teléfono debe contener solo dígitos");
            return;
        }
        if (motivo === "") {
            toast.error("El motivo debe ser alguna opción válida")
            return;
        }

        const success = await addCliente({ id, nombre, motivo, telefono });
        if (success) {
            setShowAddModal(false);
            setFormData({ id: "", nombre: "", motivo: "", telefono: "" });
            openAddService({ id, nombre, motivo });
        }
    };


    const handleEditSubmit = (e) => {
        e.preventDefault();
        setShowEditModal(false);
        setShowEditConfirmModal(true);
    };

    const handleEditConfirm = async () => {
        const ok = await updateCliente(formData.id, formData);
        setShowEditConfirmModal(false);

        if (ok) {
            toast.success(`Cliente "${formData.nombre}" actualizado correctamente`);
        } else {
            toast.error("No se pudo actualizar el cliente");
        }
    };

    const handleDeleteConfirm = async () => {
        const ok = await deleteCliente(selectedClient.id);
        setShowDeleteModal(false);

        if (ok) {
            toast.success(`Cliente "${selectedClient.nombre}" eliminado correctamente`);
        } else {
            toast.error("No se pudo eliminar el cliente");
        }
    };

    const historialCitas = Array.isArray(citas) && selectedClient?.id
        ? [...citas]
            .filter((cita) => cita.clientes_servicio?.cliente_id === selectedClient.id)
            .sort((a, b) => {
                const getTimestamp = (cita) => {
                    const [year, month, day] = cita.fecha.split("-");
                    const [hour, minute] = cita.hora.split(":");
                    return new Date(year, month - 1, day, hour, minute).getTime();
                };
                return getTimestamp(b) - getTimestamp(a); // más recientes primero
            })
        : [];


    useEffect(() => {
        if (clientes.length > 0) {
            const seleccion = [...clientes]
                .sort(() => Math.random() - 0.5) // mezcla el array
                .slice(0, 15); // toma solo 10
            setClientesAleatorios(seleccion);
        }
    }, [clientes]);

    const debouncedQuery = useDebounce(query, 300);

    const filteredClients = useMemo(() => {
        if (!debouncedQuery) return [];
        return clientes.filter((c) =>
            c.nombre.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            c.id.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            c.telefono?.includes(debouncedQuery)
        );
    }, [clientes, debouncedQuery]);

    const serviciosDisponibles = {
        Valoracion: [{ value: "valoracion", label: "Valoración" }],
        Terapia: [
            { value: "terapia_fisica", label: "Terapia Física" },
            { value: "drenaje_linfatico", label: "Drenaje Linfático" },
            { value: "piso_pelvico", label: "Piso Pélvico" },
            { value: "terapia_respiratoria", label: "Terapia Respiratoria" },
        ],
    };

    const opcionesServicio = selectedClient?.motivo
        ? serviciosDisponibles[selectedClient.motivo] || []
        : [];

    const citasPorServicio = historialCitas.reduce((acc, cita) => {
        const key = cita.clientes_servicio?.servicio;
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(cita);
        return acc;
    }, {});

    return (
        <div className="p-2 mx-auto">
            <Card className="mb-6 py-2">
                <CardContent className="p-4 space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700">Administración de Clientes</h3>
                        <p className="text-gray-500">Gestiona la información de todos tus pacientes</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                            className="cursor-pointer bg-blue-50 hover:bg-blue-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center space-y-2"
                            onClick={openAddModal}
                        >
                            <div className="bg-blue-100 text-blue-700 rounded-full p-4">
                                <Icon name="personplus" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Registrar Nuevo Usuario</h3>
                            <p className="text-sm text-gray-600">Agregar un nuevo paciente al sistema</p>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Lista de Clientes</h3>
                            <p className="text-sm text-gray-500">{clientes.length} clientes registrados</p>
                        </div>
                        <div className="flex items-center w-full md:w-64 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                            <Icon name="search" className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>

                <Table className={"min-w-full text-sm"}>
                    <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                        <TableRow className="text-left text-sm font-medium text-gray-700">
                            <TableHead className="px-4 py-3">Cliente</TableHead>
                            <TableHead className="px-4 py-3">Documento</TableHead>
                            <TableHead className="px-4 py-3">Teléfono</TableHead>
                            <TableHead className="px-4 py-3">Motivo</TableHead>
                            <TableHead className="px-4 py-3 flex">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(debouncedQuery ? filteredClients : clientesAleatorios).map(cliente => (
                            <TableRow key={cliente.id}>
                                <TableCell className="font-semibold text-sm px-4 py-3">
                                    <div className='flex items-center gap-3'>
                                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                                            <Icon className='text-blue-400' name={"person"} />
                                        </div>
                                        {cliente.nombre}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm px-4 py-3 w-50">{cliente.id}</TableCell>
                                <TableCell className="text-sm px-4 py-3 w-50">{cliente.telefono}</TableCell>
                                <TableCell className="text-sm px-4 py-3 w-50">
                                    <span className={`inline-block min-w-[15px] px-2 text-sm font-medium text-center rounded ${getMotivoColor(cliente.motivo)}`}>
                                        {motivoLabels[cliente.motivo] || cliente.motivo}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right w-50">
                                    <div className="flex gap-2">
                                        <Button title="Gestión de Servicios" className={"cursor-pointer bg-amber-200 hover:bg-amber-400 text-amber-700 hover:text-white transition-colors"} variant="outline" size="sm" onClick={() => openAddService(cliente)}>
                                            <Icon name={"personservices"} />
                                        </Button>
                                        <Button
                                            title="Ver historial"
                                            className={"cursor-pointer bg-blue-100 hover:bg-blue-500 text-blue-500 hover:text-white transition-colors"} variant="outline" size="sm"
                                            onClick={() => {
                                                setSelectedClient(cliente);
                                                setModoHistorial("resumen");
                                                setShowHistoryModal(true);
                                            }}
                                        >
                                            <Icon name={"calendar"} />
                                        </Button>

                                        <Button title="Editar Cliente" className={"cursor-pointer bg-green-100 hover:bg-green-500 text-green-600 hover:text-white transition-colors"} variant="outline" size="sm" onClick={() => openEditModal(cliente)}>
                                            <Icon name={"edit"} />
                                        </Button>
                                        <Button title="Eliminar Cliente" className={"cursor-pointer bg-red-100 hover:bg-red-500 text-red-500 hover:text-white transition-colors"} variant="outline" size="sm" onClick={() => openDeleteModal(cliente)}>
                                            <Icon name={"delete"} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(debouncedQuery && filteredClients.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                    No se encontraron clientes
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal para Añadir Cliente */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96">
                        <h3 className="font-bold mb-4 text-gray-800 text-center">Añadir Nuevo Cliente</h3>
                        <form onSubmit={handleAddSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-700">Número de documento</label>
                                <Input
                                    inputMode="numeric"
                                    value={formData.id}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (/^\d*$/.test(v)) {
                                            setFormData({ ...formData, id: v });
                                        }
                                    }}
                                    required
                                />

                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Nombre completo</label>
                                <Input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-sm text-gray-700'>Número de Teléfono</label>
                                <Input
                                    inputMode="numeric"
                                    value={formData.telefono}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (/^\d*$/.test(v)) {
                                            setFormData({ ...formData, telefono: v });
                                        }
                                    }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Motivo</label>
                                <select
                                    value={formData.motivo}
                                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value='' disabled>Selecciona una opción</option>
                                    <option value="Terapia">Terapia</option>
                                    <option value="Valoracion">Valoración</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2 mt-4">
                                <Button className={"cursor-pointer"} type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                                    Cancelar
                                </Button>
                                <Button className={"cursor-pointer bg-green-600 hover:bg-green-700"} type="submit">Guardar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Editar Cliente */}
            {showEditModal && selectedClient && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96">
                        <h3 className="font-bold mb-4 text-gray-800 text-center">Editar Cliente</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-700">Número de documento</label>
                                <Input
                                    type="text"
                                    readOnly
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Nombre completo</label>
                                <Input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-sm text-gray-700'>Número de Teléfono</label>
                                <Input
                                    inputMode="numeric"
                                    value={formData.telefono}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (/^\d*$/.test(v)) {
                                            setFormData({ ...formData, telefono: v });
                                        }
                                    }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Motivo</label>
                                <select
                                    value={formData.motivo}
                                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value='' disabled>Selecciona una opción</option>
                                    <option value="Terapia">Terapia</option>
                                    <option value="Valoracion">Valoración</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <Button className={"cursor-pointer"} type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                                    Cancelar
                                </Button>
                                <Button className={"cursor-pointer bg-green-600 hover:bg-green-700"} type="submit">Guardar Cambios</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Editar */}
            {showEditConfirmModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96 text-center">
                        <h3 className="font-bold mb-4 text-gray-800">Confirmar Edición</h3>
                        <p className="text-gray-700 mb-6">
                            ¿Estás seguro de que deseas guardar los cambios para este cliente?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <Button className={"cursor-pointer"} variant="outline" onClick={() => setShowEditConfirmModal(false)}>
                                Cancelar
                            </Button>
                            <Button className={"cursor-pointer bg-green-600 hover:bg-green-700"} onClick={handleEditConfirm}>
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Eliminar */}
            {showDeleteModal && selectedClient && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96 text-center">
                        <h3 className="font-bold mb-4 text-gray-800">Confirmar Eliminación</h3>
                        <p className="text-gray-700 mb-6">
                            ¿Estás seguro de que deseas eliminar a "{selectedClient.nombre}"?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <Button className={"cursor-pointer"} variant="outline" onClick={() => setShowDeleteModal(false)}>
                                No
                            </Button>
                            <Button className={"cursor-pointer hover:bg-red-700"} variant="destructive" onClick={handleDeleteConfirm}>
                                Sí, eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Ver Historial */}
            {showHistoryModal && selectedClient && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-[600px]">
                        {/* Encabezado */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                            <div>
                                <h3 className="font-bold text-gray-800 text-xl">
                                    {modoHistorial === "resumen"
                                        ? "Historial de Servicios"
                                        : `Historial de Citas de ${selectedClient?.nombre}`}
                                </h3>
                                {modoHistorial === "detalle" && servicioDetalle && (
                                    <p className="text-sm text-gray-500">
                                        Servicio: {servicioLabels[servicioDetalle] || servicioDetalle}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {modoHistorial === "detalle" && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            const citasFiltradas = citasPorServicio[servicioDetalle] || [];
                                            generarPDFHistorial(selectedClient, citasFiltradas);
                                        }}
                                        className="cursor-pointer bg-blue-600 text-white hover:bg-blue-800 hover:text-white transition-colors"
                                    >
                                        Imprimir
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowHistoryModal(false);
                                        setModoHistorial("resumen");
                                        setServicioDetalle(null);
                                    }}
                                    className="cursor-pointer bg-red-600 text-white hover:bg-red-700 transition-colors hover:text-white"
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {modoHistorial === "resumen" ? (
                                Object.entries(citasPorServicio).map(([servicio, citas], index) => {
                                    const sesiones = citas.length;
                                    const fechaInicio = citas[citas.length - 1]?.fecha || "—";
                                    return (
                                        <Card key={index} className="p-4 bg-gray-50">
                                            <CardContent className="p-0">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm text-gray-700">
                                                        <p><strong>Servicio:</strong> {servicioLabels[servicio] || servicio}</p>
                                                        <p><strong>Sesiones:</strong> {sesiones}</p>
                                                        <p><strong>Desde:</strong> {fechaInicio}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setServicioDetalle(servicio);
                                                                setModoHistorial("detalle");
                                                            }}
                                                            className="cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                                                        >
                                                            Ver
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => generarPDFHistorial(selectedClient, citas)}
                                                            className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 hover:text-white transition-colors"
                                                        >
                                                            Imprimir
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                (citasPorServicio[servicioDetalle] || []).map((cita, index) => (
                                    <Card key={index} className="p-4 bg-gray-50">
                                        <CardContent className="p-0">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-700">
                                                    <p><strong>Fecha:</strong> {cita.fecha}</p>
                                                    <p><strong>Hora:</strong> {typeof cita.hora === "string" ? cita.hora.slice(0, 5) : "—"}</p>
                                                    <p>
                                                        <strong>Estado:</strong>{" "}
                                                        <span className={`inline-block min-w-[15px] px-2 text-sm font-medium text-white text-center rounded ${getEstadoColor(cita.estado)}`}>
                                                            {estadoLabels[cita.estado] || cita.estado}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}



            {/* Modal para añadir servicio */}
            {showAddServicioModal && selectedClient && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96">
                        <h3 className="font-bold mb-4 text-gray-800 text-center">
                            Gestión de Servicios
                        </h3>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!nuevoServicio) return;
                                const success = await asignarServicio(nuevoServicio);
                                if (success) {
                                    setNuevoServicio("");
                                    setShowAddServicioModal(false);
                                }
                            }}
                            className="space-y-4"
                        >
                            {/* Nombre del paciente */}
                            <div>
                                <label className="block text-sm text-gray-700">Nombre del paciente</label>
                                <Input
                                    type="text"
                                    value={selectedClient.nombre}
                                    readOnly
                                    className="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            {/* Documento del paciente */}
                            <div>
                                <label className="block text-sm text-gray-700">Número de documento</label>
                                <Input
                                    type="text"
                                    value={selectedClient.id}
                                    readOnly
                                    className="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            {/* Select de servicio */}
                            <div>

                                {servicios.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Servicios ya asignados</label>
                                        <ul className="space-y-1">
                                            {servicios.map((s) => (
                                                <li key={s.id} className="flex items-center justify-between bg-gray-50 px-3 py-1 rounded text-sm text-gray-700 border border-gray-200">
                                                    <span>{servicioLabels[s.servicio] || s.servicio}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarServicio(s.id)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                    >
                                                        Eliminar
                                                    </button>


                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <label className="block text-sm text-gray-700">Servicio</label>
                                <select
                                    value={nuevoServicio}
                                    onChange={(e) => setNuevoServicio(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                                >
                                    <option value="" disabled>Selecciona un servicio</option>
                                    {opcionesServicio.map((op) => (
                                        <option key={op.value} value={op.value}>
                                            {op.label}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            {/* Botones */}
                            <div className="flex justify-end space-x-2">
                                <Button type="button" className={"cursor-pointer "} variant="outline" onClick={() => setShowAddServicioModal(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white">
                                    Guardar
                                </Button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>

    );
};

export default ClientesPage;