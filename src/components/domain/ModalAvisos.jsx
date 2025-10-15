import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/supabaseClient";
import Icon from "@/components/shared/Icons";
import { toast } from "react-hot-toast";

const ModalAvisos = ({ visible, onClose, avisos = [], recargar, eliminarAviso }) => {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [expiracion, setExpiracion] = useState("");
    const [prioridad, setPrioridad] = useState("");
    const [avisoAEliminar, setAvisoAEliminar] = useState(null);

    const handleAgregar = async () => {
        if (!titulo.trim() || !mensaje.trim() || !expiracion) return;

        const [year, month, day] = expiracion.split("-");
        const fechaLocal = new Date(`${year}-${month}-${day}T23:59:00-05:00`);
        const nuevoAviso = {
            titulo: titulo.trim(),
            contenido: mensaje.trim(),
            fecha_expiracion: fechaLocal.toISOString(),
            prioridad,
        };

        if (!titulo.trim() || !mensaje.trim() || !prioridad || !expiracion) return;
        const { error } = await supabase.from("avisos").insert(nuevoAviso);

        if (!error) {
            toast.success("Aviso creado correctamente");
            recargar();
            setTitulo("");
            setMensaje("");
            setExpiracion("");
            setMostrarFormulario(false);
        } else {
            console.error("Error al guardar aviso:", error.message);
            toast.error("Error al guardar el aviso");
        }
    };

    const handleEliminar = async () => {
        if (!avisoAEliminar) return;

        const exito = await eliminarAviso(avisoAEliminar.id);

        if (exito) {
            toast.success("Aviso eliminado correctamente");
            setAvisoAEliminar(null);
        } else {
            toast.error("Error al eliminar el aviso");
        }
    };



    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 z-[9998] backdrop-blur-sm bg-white/30 flex items-center justify-center"
                onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 500 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-6 w-75 md:w-[450px] max-h-[80vh] overflow-y-auto shadow-2xl relative border border-gray-200"
                    >

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <Icon name="bell" className="w-7 h-7 text-yellow-500" />
                                Avisos <span className="text-gray-500">({avisos.length})</span>
                            </h2>
                            <motion.button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Icon name="close" className="w-6 h-6 text-gray-500" />
                            </motion.button>
                        </div>


                        <motion.button
                            onClick={() => setMostrarFormulario(!mostrarFormulario)}
                            className="w-full flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-2xl hover:shadow-lg transition-all mb-6"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon name={mostrarFormulario ? "x" : "plus"} className="w-5 h-5" />
                            {mostrarFormulario ? "Cancelar" : "Crear Nuevo Aviso"}
                        </motion.button>

                        <AnimatePresence>
                            {mostrarFormulario ? (
                                <motion.form
                                    key="formulario-aviso"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleAgregar();
                                    }}
                                    className="space-y-4 mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-5"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <input
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        placeholder="Título del aviso"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />

                                    <textarea
                                        value={mensaje}
                                        onChange={(e) => setMensaje(e.target.value)}
                                        placeholder="Mensaje del aviso"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                                        required
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                                    <select
                                        value={prioridad}
                                        onChange={(e) => setPrioridad(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                                    >
                                        <option value="" disabled>Selecciona la prioridad</option>
                                        <option value="alta">Alta</option>
                                        <option value="media">Media</option>
                                        <option value="baja">Baja</option>
                                    </select>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha de expiración
                                        </label>
                                        <input
                                            type="date"
                                            value={expiracion}
                                            onChange={(e) => setExpiracion(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all"
                                    >
                                        <Icon name="check" className="w-5 h-5" />
                                        Agregar Aviso
                                    </button>
                                </motion.form>

                            ) : null}
                        </AnimatePresence>


                        <ul className="space-y-3">
                            <AnimatePresence>
                                {avisos.map((aviso, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        whileHover={{ y: -2 }}
                                        className={`relative p-4 rounded-xl border-l-4 ${aviso.fecha_expiracion && new Date(aviso.fecha_expiracion) < new Date()
                                            ? "border-gray-300 bg-gray-50"
                                            : aviso.prioridad === "alta"
                                                ? "border-red-500 bg-red-50"
                                                : aviso.prioridad === "media"
                                                    ? "border-yellow-400 bg-yellow-50"
                                                    : "border-green-500 bg-green-50"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                <motion.div
                                                    className={`w-2 h-2 rounded-full mt-2 ${aviso.fecha_expiracion && new Date(aviso.fecha_expiracion) < new Date()
                                                        ? "bg-gray-300"
                                                        : aviso.prioridad === "alta"
                                                            ? "bg-red-500"
                                                            : aviso.prioridad === "media"
                                                                ? "bg-yellow-500"
                                                                : "bg-green-500"
                                                        }`}
                                                    whileHover={{ scale: 1.2 }}
                                                />

                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900">{aviso.titulo}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{aviso.contenido}</p>
                                                <p
                                                    className={`text-xs font-semibold mt-2 inline-block px-2 py-1 rounded ${aviso.prioridad === "alta"
                                                            ? "text-red-700 bg-red-100"
                                                            : aviso.prioridad === "media"
                                                                ? "text-yellow-700 bg-yellow-100"
                                                                : "text-green-700 bg-green-100"
                                                        }`}
                                                >
                                                    Prioridad: {aviso.prioridad.charAt(0).toUpperCase() + aviso.prioridad.slice(1)}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                                    <Icon name="calendar" className="w-4 h-4" />
                                                    {aviso.fecha_expiracion
                                                        ? new Date(aviso.fecha_expiracion).toLocaleString("es-CO", {
                                                            timeZone: "America/Bogota",
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : "Sin fecha"}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAvisoAEliminar(aviso)}
                                                className="self-center text-red-500 hover:text-red-600"
                                                title="Eliminar aviso"
                                            >
                                                <Icon name="delete" className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.li>

                                ))}
                            </AnimatePresence>
                        </ul>

                    </motion.div>
                    <AnimatePresence>
                        {avisoAEliminar && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex items-center justify-center"
                            >
                                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        ¿Eliminar este aviso?
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar el aviso <strong>{avisoAEliminar.titulo}</strong>?
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setAvisoAEliminar(null)}
                                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleEliminar}
                                            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
                                        >
                                            Confirmar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            )
            }
        </AnimatePresence >
    );
};

export default ModalAvisos;
