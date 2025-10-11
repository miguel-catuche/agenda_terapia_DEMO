import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/Icons";
import { Card, CardContent } from "@/components/ui/card";
import { generarPDFHistorial } from "@/components/utils/generarPDFHistorial";
import { estadoLabels, getEstadoColor } from "@/helpers/colorHelper";

export default function ClientesModal({
    showAddModal,
    showEditModal,
    showEditConfirmModal,
    showDeleteModal,
    showHistoryModal,
    showAddServicioModal,
    mostrarConfirmacion,
    selectedClient,
    servicioPendienteEliminar,
    formData,
    setFormData,
    setShowAddModal,
    setShowEditModal,
    setShowEditConfirmModal,
    setShowDeleteModal,
    setShowHistoryModal,
    setShowAddServicioModal,
    setMostrarConfirmacion,
    handleAddSubmit,
    handleEditSubmit,
    handleEditConfirm,
    handleDeleteConfirm,
    servicios,
    servicioLabels,
    citasPorServicio,
    modoHistorial,
    setModoHistorial,
    servicioDetalle,
    setServicioDetalle,
    getLabel,
    intentarEliminarServicio,
    confirmarEliminacion,
    nuevoServicio,
    setNuevoServicio,
    asignarServicio,
    opcionesServicio,
    refetchServiciosGlobales,
}) {
    return (
        <>
            {/* Modal para Añadir Cliente */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => {
                        setShowAddModal(false);
                    }}>
                    <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96"
                        onClick={(e) => e.stopPropagation()}>
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
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => {
                        setShowEditModal(false)
                    }} >
                    <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96"
                        onClick={(e) => e.stopPropagation()}>
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
            )
            }
            {/* Modal de Confirmación para Editar */}
            {
                showEditConfirmModal && (
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
                )
            }
            {/* Modal de Confirmación para Eliminar */}
            {
                showDeleteModal && selectedClient && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96 text-center">
                            <h3 className="font-bold mb-4 text-gray-800">Confirmar Eliminación</h3>
                            <p className="text-gray-700 mb-4">
                                ¿Estás seguro de que deseas eliminar al paciente <strong>{selectedClient.nombre}</strong>?
                            </p>
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-6">
                                Esta acción eliminará también sus servicios asignados y todas las citas registradas. No se puede deshacer.
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button className={"cursor-pointer"} variant="outline" onClick={() => setShowDeleteModal(false)}>
                                    No
                                </Button>
                                <Button variant="destructive" className="cursor-pointer hover:bg-red-700" onClick={handleDeleteConfirm}>
                                    Sí, eliminar todo
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal para Ver Historial */}
            {
                showHistoryModal && selectedClient && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => {
                            setShowHistoryModal(false)
                        }} >
                        <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-[600px]"
                            onClick={(e) => e.stopPropagation()}>
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
                                            <Icon name="download" className="w-4 h-4" />
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
                                                                <Icon name="eye" />
                                                                Ver
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => generarPDFHistorial(selectedClient, citas)}
                                                                className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 hover:text-white transition-colors"
                                                            >
                                                                <Icon name="download" className="w-4 h-4" />

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
                )
            }
            {/* Modal para gestionar servicio */}
            {
                showAddServicioModal && selectedClient && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => {
                            setShowAddServicioModal(false)
                        }}>
                        <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96"
                            onClick={(e) => e.stopPropagation()}>
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
                                        await refetchServiciosGlobales();
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
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => intentarEliminarServicio(s)}
                                                            className="flex items-center gap-2 cursor-pointer bg-red-100 text-red-600 hover:bg-red-700 hover:text-white transition-colors"
                                                        >
                                                            <Icon name="delete" className="w-4 h-4" />
                                                            Eliminar
                                                        </Button>

                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <label className="block text-sm text-gray-700">Añadir Servicio</label>
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
                )
            }
            {/* Modal para eliminar servicio */}
            {
                mostrarConfirmacion && servicioPendienteEliminar && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-[500px]">
                            <h3 className="font-bold text-gray-800 text-lg mb-4">
                                ¿Eliminar servicio asignado?
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                El servicio <strong>{getLabel(servicioPendienteEliminar.servicio)}</strong> tiene citas asignadas.
                                ¿Estás seguro de que deseas eliminarlo?
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setMostrarConfirmacion(false);
                                        setServicioPendienteEliminar(null);
                                    }}
                                    className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={confirmarEliminacion}
                                    className="cursor-pointer bg-red-600 text-white hover:bg-red-700 hover:text-white"
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}