import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCitas } from '@/hooks/useCitas';
import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useClientes } from '@/hooks/useClientes';
import Icon from '@/components/shared/Icons';
import toast from 'react-hot-toast';
import { useClienteServicio } from '@/hooks/useClienteServicio';
import { useServicioLabels } from '@/helpers/useServicioLabels';
import { estadoLabels, getEstadoColor, getMotivoColor, motivoLabels } from '@/helpers/colorHelper';
import ClientesModal from '@/components/domain/ClientesModal';
import ModalNuevaCita from '@/components/domain/ModalNuevaCita';
import { useAgendarCita } from '@/hooks/useAgendarCita';
import { useClientesServicioGlobal } from '@/hooks/useClientesServicioGlobal';

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
    const [servicioPendienteEliminar, setServicioPendienteEliminar] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const { serviciosGlobales, refetchServiciosGlobales } = useClientesServicioGlobal();

    const {
        showForm: showCitaModal,
        selectedClient: selectedClientCita,
        formData: formDataCita,
        servicios: serviciosCita,
        setFormData: setFormDataCita,
        setShowForm: setShowCitaModal,
        isSubmitting,
        searchTerm,
        searchResults,
        handleSearchChange,
        handleSelectClient,
        handleSubmit,
        openModal: openCitaModal
    } = useAgendarCita(clientes, serviciosGlobales);

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
                return getTimestamp(b) - getTimestamp(a);
            })
        : [];


    useEffect(() => {
        if (clientes.length > 0) {
            const seleccion = [...clientes]
                .sort(() => Math.random() - 0.5)
                .slice(0, 15);
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
            { value: "terapia_vestibular", label: "Terapia Vestibular" },
            { value: "acondicionamiento_fisico", label: "Acondicionamiento Físico" },
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

    const intentarEliminarServicio = async (servicio) => {
        const resultado = await eliminarServicio(servicio.id);

        if (resultado === "requiere-confirmacion") {
            setServicioPendienteEliminar(servicio);
            setMostrarConfirmacion(true);
        }
    };

    const confirmarEliminacion = async () => {
        await eliminarServicio(servicioPendienteEliminar.id, true);
        setMostrarConfirmacion(false);
        setServicioPendienteEliminar(null);
    };


    return (
        <div className="p-2 mx-auto">
            <Card className="mb-6 py-2">
                <CardContent className="p-4 space-y-4" id="adminClientTour">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700">Administración de Clientes</h3>
                        <p className="text-gray-500">Gestiona la información de todos tus pacientes</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            id='registerBtnTour'
                            className="cursor-pointer bg-blue-100 hover:bg-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center space-y-2"
                            onClick={openAddModal}
                        >
                            <div className="bg-blue-200 text-blue-700 rounded-full p-4">
                                <Icon name="personplus" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Registrar Nuevo Usuario</h3>
                            <p className="text-sm text-gray-600">Agregar un nuevo paciente al sistema</p>
                        </div>
                        <div
                            id='addBtnTour'
                            className="cursor-pointer bg-green-100 hover:bg-green-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center space-y-2"
                            onClick={openCitaModal}
                        >
                            <div className="bg-green-200 text-green-700 rounded-full p-4">
                                <Icon name="calendarPlus" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Añadir Nueva Cita</h3>
                            <p className="text-sm text-gray-600">Agregar una cita al sistema</p>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <div className="bg-white rounded-xl shadow-md mb-8" id='clientListTour'>
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Lista de Clientes</h3>
                            <p className="text-sm text-gray-500">{clientes.length} clientes registrados</p>
                        </div>
                        <div className="flex items-center w-full md:w-64 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                            <Icon name="search" className="text-gray-400 mr-2" />
                            <input
                                id='searchClientTour'
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
                                <TableCell className="font-semibold text-sm px-4 py-3" id="eachClientTour">
                                    <div className='flex items-center gap-3'>
                                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                                            <Icon className='text-blue-400' name={"person"} />
                                        </div>
                                        {cliente.nombre}
                                    </div>
                                </TableCell>
                                <TableCell id="clientIdTour" className="text-sm px-4 py-3 w-50">{cliente.id}</TableCell>
                                <TableCell id="clientPhoneTour" className="text-sm px-4 py-3 w-50">{cliente.telefono}</TableCell>
                                <TableCell id="clientReasonTour" className="text-sm px-4 py-3 w-50">
                                    <span className={`inline-block min-w-[15px] px-2 text-sm font-medium text-center rounded ${getMotivoColor(cliente.motivo)}`}>
                                        {motivoLabels[cliente.motivo] || cliente.motivo}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right w-50">
                                    <div className="flex gap-2" id='clientActionsTour' >
                                        <Button id="clientServiceTour" title="Gestión de Servicios" className={"cursor-pointer bg-amber-200 hover:bg-amber-400 text-amber-700 hover:text-white transition-colors"} variant="outline" size="sm" onClick={() => openAddService(cliente)}>
                                            <Icon name={"personservices"} />
                                        </Button>
                                        <Button
                                            id="clientHistoryTour"
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

                                        <Button id="clientEditTour" title="Editar Cliente" className={"cursor-pointer bg-green-100 hover:bg-green-500 text-green-600 hover:text-white transition-colors"} variant="outline" size="sm" onClick={() => openEditModal(cliente)}>
                                            <Icon name={"edit"} />
                                        </Button>
                                        <Button id="clientDeleteTour" title="Eliminar Cliente" className={"cursor-pointer bg-red-100 hover:bg-red-500 text-red-500 hover:text-white transition-colors"} variant="outline" size="sm" onClick={() => openDeleteModal(cliente)}>
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

            <ClientesModal
                showAddModal={showAddModal}
                showEditModal={showEditModal}
                showEditConfirmModal={showEditConfirmModal}
                showDeleteModal={showDeleteModal}
                showHistoryModal={showHistoryModal}
                showAddServicioModal={showAddServicioModal}
                mostrarConfirmacion={mostrarConfirmacion}
                selectedClient={selectedClient}
                servicioPendienteEliminar={servicioPendienteEliminar}
                formData={formData}
                setFormData={setFormData}
                setShowAddModal={setShowAddModal}
                setShowEditModal={setShowEditModal}
                setShowEditConfirmModal={setShowEditConfirmModal}
                setShowDeleteModal={setShowDeleteModal}
                setShowHistoryModal={setShowHistoryModal}
                setShowAddServicioModal={setShowAddServicioModal}
                setMostrarConfirmacion={setMostrarConfirmacion}
                handleAddSubmit={handleAddSubmit}
                handleEditSubmit={handleEditSubmit}
                handleEditConfirm={handleEditConfirm}
                handleDeleteConfirm={handleDeleteConfirm}
                servicios={servicios}
                servicioLabels={servicioLabels}
                citasPorServicio={citasPorServicio}
                modoHistorial={modoHistorial}
                setModoHistorial={setModoHistorial}
                servicioDetalle={servicioDetalle}
                setServicioDetalle={setServicioDetalle}
                getLabel={getLabel}
                intentarEliminarServicio={intentarEliminarServicio}
                confirmarEliminacion={confirmarEliminacion}
                nuevoServicio={nuevoServicio}
                setNuevoServicio={setNuevoServicio}
                asignarServicio={asignarServicio}
                opcionesServicio={opcionesServicio}
                refetchServiciosGlobales={refetchServiciosGlobales}
            />
            <ModalNuevaCita
                showForm={showCitaModal}
                selectedClient={selectedClientCita}
                searchTerm={searchTerm}
                searchResults={searchResults}
                formData={formDataCita}
                servicios={serviciosCita}
                allowedHours={["07", "08", "09", "10", "14", "15", "16", "17"]}
                allowedMinutes={["00", "15", "30", "45"]}
                getLabel={getLabel}
                handleSearchChange={handleSearchChange}
                handleSelectClient={handleSelectClient}
                setFormData={setFormDataCita}
                setShowForm={setShowCitaModal}
            />

        </div >

    );
};

export default ClientesPage;