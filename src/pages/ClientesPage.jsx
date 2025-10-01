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
import html2pdf from 'html2pdf.js';
import { generarPDFHistorial } from '@/components/utils/generarPDFHistorial';
import HistorialDocumento from '@/components/HistorialDocumento';
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
    const { citas, loading, refetch } = useCitas(startDate, endDate);


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
            .filter((cita) => `${cita.cliente_id}` === `${selectedClient.id}`)
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
                .slice(0, 10); // toma solo 10
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


    const pdfRef = useRef();

    const handlePrint = () => {
        const element = pdfRef.current;
        const opt = {
            margin: 0.5,
            filename: `historial-${selectedClient?.nombre || "cliente"}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };


    return (
        <div className="p-2 mx-auto">

            <Card className="mb-6">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700">Administración de Clientes</h3>
                        <p className="text-gray-500">Gestiona la información de todos tus pacientes</p>
                    </div>
                    <div className="flex justify-center md:justify-end">
                        <Button className={"cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"}
                            onClick={openAddModal}>
                            <Icon name={"plus"} />Añadir Nuevo Cliente
                        </Button>
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

                </CardContent>
            </Card>

            <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Lista de Clientes</h3>
                        <p className="text-sm text-gray-500">{clientes.length} clientes registrados</p>
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
                                        <Button title="Ver historial" className={"cursor-pointer bg-blue-100 hover:bg-blue-500 text-blue-500 hover:text-white transition-colors"} variant="outline" size="sm" onClick={() => openHistoryModal(cliente)}>
                                            <Icon name={"calendar"} />
                                        </Button>
                                        <Button title="Editar" className={"cursor-pointer bg-green-100 hover:bg-green-500 text-green-600 hover:text-white transition-colors"} variant="outline" size="sm" onClick={() => openEditModal(cliente)}>
                                            <Icon name={"edit"} />
                                        </Button>
                                        <Button title="Eliminar" className={"cursor-pointer bg-red-100 hover:bg-red-500 text-red-500 hover:text-white transition-colors"} variant="outline" size="sm" onClick={() => openDeleteModal(cliente)}>
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
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                            <h3 className="font-bold text-gray-800 text-xl text-center sm:text-left">
                                Historial de Citas de {selectedClient?.nombre || "Cliente"}
                            </h3>

                            <div className="flex justify-center sm:justify-end gap-2">
                                {historialCitas.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => generarPDFHistorial(selectedClient, historialCitas)}
                                        className="cursor-pointer hover:text-white bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Imprimir
                                    </Button>                                   
                                )}
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowHistoryModal(false)}
                                    className="cursor-pointer hover:text-white bg-red-600 text-white hover:bg-red-700"
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>


                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">

                            {historialCitas.length > 0 ? (

                                historialCitas.map((cita, index) => (

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
                            ) : (
                                <div className="text-center text-gray-500">
                                    <p>No se encontraron citas para este cliente.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default ClientesPage;