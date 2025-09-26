'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QuimicaMasterGame: React.FC = () => {
    // Estados de navegación
    const [currentScreen, setCurrentScreen] = useState('inicio');
    const [userProgress, setUserProgress] = useState(0);
    const [userName, setUserName] = useState('');
    const [avatar, setAvatar] = useState(1);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Estados del laboratorio
    const [selectedSolute, setSelectedSolute] = useState('');
    const [selectedSolvent, setSelectedSolvent] = useState('agua');
    const [concentration, setConcentration] = useState(0);
    const [solutionType, setSolutionType] = useState('');
    const [experimentHistory, setExperimentHistory] = useState<any[]>([]);
    const [currentChallenge, setCurrentChallenge] = useState(1); // Se inicia en el desafío 1
    const [score, setScore] = useState(0);

    // Referencias de audio - CORRECCIÓN 1: Se usa HTMLAudioElement | null
    const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
    const successSoundRef = useRef<HTMLAudioElement | null>(null);
    const errorSoundRef = useRef<HTMLAudioElement | null>(null);
    const pourSoundRef = useRef<HTMLAudioElement | null>(null);

    // Efecto para manejar música de fondo
    useEffect(() => {
        if (soundEnabled && backgroundMusicRef.current) {
            backgroundMusicRef.current.volume = 0.3;
            backgroundMusicRef.current.play().catch(() => {});
        } else if (backgroundMusicRef.current) {
            backgroundMusicRef.current.pause();
        }
    }, [soundEnabled, currentScreen]);

    // Datos de desafíos
    const challenges = [
        {
            id: 1,
            title: "Solución Salina Básica",
            description: "Crea una solución salina al 5% de concentración",
            targetSolute: "sal",
            targetConcentration: 5,
            hint: "Recuerda: 5g de sal por cada 100ml de agua"
        },
        {
            id: 2,
            title: "Solución Azucarada Saturada",
            description: "Identifica el punto de saturación del azúcar en agua",
            targetSolute: "azúcar",
            targetConcentration: 65, // Aproximadamente saturación a 20°C
            hint: "Sigue añadiendo azúcar hasta que no se disuelva más"
        },
        {
            id: 3,
            title: "Mezcla Perfecta",
            description: "Crea una solución alcohólica al 15%",
            targetSolute: "alcohol",
            targetConcentration: 15,
            hint: "15ml de alcohol por cada 100ml de solución total"
        }
    ];

    // Función para calcular tipo de solución
    const calculateSolutionType = (solute: string, conc: number) => {
        const saturationPoints: Record<string, number> = {
            'sal': 36,    // g/100ml a 20°C
            'azúcar': 65, // g/100ml a 20°C
            'alcohol': 100 // miscible en todas proporciones
        };

        if (!solute) return '';
        if (conc === 0) return 'sin soluto';
        // El umbral de diluida es un poco arbitrario para fines de juego
        if (conc < 5) return 'diluida';
        // Se asegura que no exceda el límite conocido (aunque en el juego el máximo es 100%)
        const maxConc = saturationPoints[solute] || 100;
        if (conc >= maxConc) return 'saturada';
        return 'concentrada';
    };

    // Función para crear solución
    const createSolution = () => {
        if (!selectedSolute) {
            if (errorSoundRef.current && soundEnabled) errorSoundRef.current.play();
            return;
        }

        const solution = {
            solute: selectedSolute,
            solvent: selectedSolvent,
            concentration,
            type: calculateSolutionType(selectedSolute, concentration),
            timestamp: new Date().toLocaleTimeString()
        };

        setExperimentHistory(prev => [...prev, solution]);

        // Verificar si completa un desafío
        if (currentChallenge > 0 && currentChallenge <= challenges.length) {
            const challenge = challenges[currentChallenge - 1];
            // Tolerancia de +/- 2%
            if (solution.solute === challenge.targetSolute &&
                Math.abs(solution.concentration - challenge.targetConcentration) <= 2) {
                setScore(prev => prev + 100);
                if (successSoundRef.current && soundEnabled) successSoundRef.current.play();
                setCurrentChallenge(prev => prev + 1); // Avanza al siguiente desafío
            }
        }

        if (pourSoundRef.current && soundEnabled) pourSoundRef.current.play();
    };

    // Pantalla de Inicio
    const renderInicio = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6 text-center"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mb-8"
            >
                <img
                    src="https://placeholder-image-service.onrender.com/image/200x200?prompt=portal dimensional giratorio con efectos de partículas cósmicas&id=portal-1"
                    alt="Portal dimensional giratorio con efectos de partículas cósmicas y energía brillante"
                    className="w-48 h-48 rounded-full border-4 border-yellow-400 shadow-2xl"
                />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-yellow-300">
                ¡Bienvenido, futuro Maestro Químico!
            </h1>

            <p className="text-xl md:text-2xl mb-8 max-w-3xl leading-relaxed">
                Has sido elegido para ingresar al laboratorio más avanzado del universo.
                Aquí no solo aprenderás sobre soluciones químicas, sino que las crearás con tus propias manos virtuales.
            </p>

            <div className="mb-8 p-6 bg-black bg-opacity-50 rounded-xl">
                <h2 className="text-2xl mb-4 text-yellow-200">Personaliza tu avatar:</h2>
                <div className="flex gap-4 mb-4">
                    {[1, 2, 3].map(num => (
                        <motion.div
                            key={num}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`cursor-pointer p-2 rounded-lg ${avatar === num ? 'bg-yellow-500' : 'bg-gray-700'}`}
                            onClick={() => setAvatar(num)}
                        >
                            <img
                                src={`https://placeholder-image-service.onrender.com/image/80x80?prompt=avatar de científico ${num} con bata de laboratorio&id=avatar-${num}`}
                                alt={`Avatar de científico ${num} con bata de laboratorio y equipo de protección`}
                                className="w-16 h-16 rounded-full"
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-lg">Nombre del científico:</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Ingresa tu nombre"
                        className="px-4 py-2 rounded-lg text-black w-full max-w-md"
                    />
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentScreen('laboratorio')} // Se cambia a 'laboratorio' para empezar la acción
                disabled={!userName.trim()}
                className="px-8 py-4 bg-yellow-500 text-black text-xl font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {userName ? `¡Empezar Aventura, ${userName}!` : 'Ingresa tu nombre para comenzar'}
            </motion.button>

            <div className="mt-8 flex items-center gap-2">
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                    {soundEnabled ? '🔊' : '🔇'}
                </button>
                <span className="text-sm">Sonido {soundEnabled ? 'Activado' : 'Desactivado'}</span>
            </div>
        </motion.div>
    );

    // Tutorial Interactivo
    const renderTutorial = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8">
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setCurrentScreen('inicio')}
                    className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                >
                    ← Volver al Inicio
                </motion.button>

                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 text-center">
                    📚 Tutorial Interactivo
                </h1>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Conceptos Básicos */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-blue-50 p-6 rounded-lg"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-blue-800">🧪 Conceptos Básicos</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🧂</span>
                                <div>
                                    <strong>Soluto:</strong> La sustancia que se disuelve
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💧</span>
                                <div>
                                    <strong>Solvente:</strong> La sustancia que disuelve (generalmente agua)
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🥤</span>
                                <div>
                                    <strong>Solución:</strong> La mezcla homogénea resultante
                                </div>
                            </div>
                        </div>

                        <motion.div
                            className="mt-6 p-4 bg-white rounded-lg border-2 border-dashed border-blue-300"
                            whileHover={{ scale: 1.02 }}
                        >
                            <p className="text-center text-lg font-semibold text-blue-700">
                                🧂 Soluto + 💧 Solvente = 🥤 Solución
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Tipos de Soluciones */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-green-50 p-6 rounded-lg"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-green-800">📊 Tipos de Soluciones</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <span>Diluidas:</span>
                                <span className="text-sm text-gray-600">Poca cantidad de soluto</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <span>Concentradas:</span>
                                <span className="text-sm text-gray-600">Mucha cantidad de soluto</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <span>Saturadas:</span>
                                <span className="text-sm text-gray-600">Máxima cantidad posible</span>
                            </div>
                        </div>

                        <div className="mt-6 bg-white p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm">Concentración:</span>
                                <span className="font-bold">{concentration}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={concentration}
                                onChange={(e) => setConcentration(Number(e.target.value))}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-center mt-2 text-sm text-gray-600">
                                Tipo: {calculateSolutionType(selectedSolute || 'sal', concentration)}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <button
                        onClick={() => setCurrentScreen('laboratorio')}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
                    >
                        🧪 Ir al Laboratorio Virtual
                    </button>
                </motion.div>
            </div>
        </div>
    );

    // Laboratorio Virtual
    const renderLaboratorio = () => (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-lg">
                    <button
                        onClick={() => setCurrentScreen('tutorial')}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        ← Volver al Tutorial
                    </button>

                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">🧪 Laboratorio Virtual</h1>
                        <p className="text-gray-600">Científico: {userName}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="font-bold text-lg">Puntuación: {score}</div>
                            <div className="text-sm text-gray-600">Nivel: {currentChallenge > challenges.length ? 'Finalizado' : `${currentChallenge}/${challenges.length}`}</div>
                        </div>
                        <img
                            src={`https://placeholder-image-service.onrender.com/image/50x50?prompt=avatar de científico ${avatar} con bata&id=avatar-sm-${avatar}`}
                            alt={`Avatar del científico ${userName}`}
                            className="w-10 h-10 rounded-full border-2 border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Panel de Control */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">⚙️ Panel de Control</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 font-semibold">Seleccionar Soluto:</label>
                                <select
                                    value={selectedSolute}
                                    onChange={(e) => setSelectedSolute(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Selecciona un soluto</option>
                                    <option value="sal">Sal (NaCl)</option>
                                    <option value="azúcar">Azúcar (C₁₂H₂₂O₁₁)</option>
                                    <option value="alcohol">Alcohol (C₂H₅OH)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold">Solvente:</label>
                                <select
                                    value={selectedSolvent}
                                    onChange={(e) => setSelectedSolvent(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="agua">Agua (H₂O)</option>
                                    <option value="etanol">Etanol</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold">
                                    Concentración: {concentration}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={concentration}
                                    onChange={(e) => setConcentration(Number(e.target.value))}
                                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-sm text-gray-600 mt-1">
                                    Tipo: {calculateSolutionType(selectedSolute, concentration)}
                                </div>
                            </div>

                            <button
                                onClick={createSolution}
                                disabled={!selectedSolute}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                🧪 Crear Solución
                            </button>
                        </div>
                    </div>

                    {/* Visualización de la Solución */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">🔍 Visualización</h2>

                        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg mb-4">
                            {selectedSolute ? (
                                <>
                                    <div className="w-32 h-48 bg-blue-100 border-2 border-blue-300 rounded-lg relative overflow-hidden">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                                            style={{
                                                height: `${concentration}%`,
                                                backgroundColor: selectedSolute === 'sal' ? '#a0d2eb' :
                                                    selectedSolute === 'azúcar' ? '#f8e6cb' : '#ebd0a0'
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2 text-lg font-semibold">
                                        {selectedSolute} al {concentration}% en {selectedSolvent}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Tipo: {calculateSolutionType(selectedSolute, concentration)}
                                    </p>
                                </>
                            ) : (
                                <div className="text-gray-500 text-center">
                                    <span className="text-4xl">🥤</span>
                                    <p>Selecciona un soluto para comenzar</p>
                                </div>
                            )}
                        </div>

                        {/* Información de la solución actual */}
                        {selectedSolute && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">📋 Información de la Solución:</h3>
                                <div className="text-sm space-y-1">
                                    <div>Soluto: {selectedSolute}</div>
                                    <div>Solvente: {selectedSolvent}</div>
                                    <div>Concentración: {concentration}%</div>
                                    <div>Tipo: {calculateSolutionType(selectedSolute, concentration)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desafíos Actuales */}
                {currentChallenge > 0 && currentChallenge <= challenges.length ? (
                    <div className="bg-yellow-50 p-6 rounded-xl shadow-lg mb-6">
                        <h2 className="text-xl font-bold mb-4 text-yellow-800">🎯 Desafío Actual</h2>
                        <div className="bg-white p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">{challenges[currentChallenge - 1].title}</h3>
                            <p className="text-gray-700 mb-3">{challenges[currentChallenge - 1].description}</p>
                            <div className="bg-gray-100 p-3 rounded">
                                <span className="text-sm font-semibold">💡 Pista:</span>
                                <p className="text-sm">{challenges[currentChallenge - 1].hint}</p>
                            </div>
                        </div>
                    </div>
                ) : currentChallenge > challenges.length ? (
                    <div className="bg-green-100 p-6 rounded-xl shadow-lg mb-6 text-center">
                        <h2 className="text-2xl font-bold text-green-700">🎉 ¡Felicidades! Desafíos Completados</h2>
                        <p className="text-lg text-gray-700">Has dominado la química de soluciones. ¡Sigue experimentando libremente!</p>
                    </div>
                ) : null}

                {/* Historial de Experimentos */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">📝 Historial de Experimentos</h2>
                    {experimentHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aún no has realizado experimentos</p>
                    ) : (
                        <div className="grid gap-2 max-h-64 overflow-y-auto">
                            {experimentHistory.slice().reverse().map((exp, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <span className="font-semibold">{exp.solute}</span> en {exp.solvent}
                                        <span className="text-sm text-gray-600 ml-2">{exp.concentration}%</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {exp.type} • {exp.timestamp}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navegación */}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={() => setCurrentScreen('tutorial')}
                        className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        📚 Volver al Tutorial
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setCurrentScreen('experimentacion')}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            🧪 Zona de Experimentación
                        </button>

                        <button
                            onClick={() => setCurrentScreen('desafios')}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            🎯 Ver Desafíos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Zona de Experimentación Libre (similar al laboratorio pero sin desafíos)
    const renderExperimentacion = () => (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => setCurrentScreen('laboratorio')}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        ← Volver al Laboratorio
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-green-800">🔬 Zona de Experimentación Libre</h1>
                    <div className="w-24"></div> {/* Espaciador */}
                </div>

                <p className="text-gray-600 mb-6 text-center">
                    Experimenta libremente con diferentes solutos y concentraciones. ¡Descubre nuevas combinaciones!
                </p>

                {/* Mismo panel de control que el laboratorio pero enfocado en exploración */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-50 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">⚗️ Controles de Experimentación</h2>
                        {/* Los mismos controles que el laboratorio */}
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 font-semibold">Seleccionar Soluto:</label>
                                <select
                                    value={selectedSolute}
                                    onChange={(e) => setSelectedSolute(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Selecciona un soluto</option>
                                    <option value="sal">Sal (NaCl)</option>
                                    <option value="azúcar">Azúcar (C₁₂H₂₂O₁₁)</option>
                                    <option value="alcohol">Alcohol (C₂H₅OH)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold">Concentración: {concentration}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={concentration}
                                    onChange={(e) => setConcentration(Number(e.target.value))}
                                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={createSolution}
                                disabled={!selectedSolute}
                                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                🧪 Realizar Experimentación
                            </button>
                        </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">🔍 Observaciones</h2>
                        <div className="h-48 bg-white border-2 border-green-300 rounded-lg p-4 flex items-center justify-center">
                            {selectedSolute ? (
                                <div className="text-center">
                                    <div className="text-6xl mb-2">
                                        {calculateSolutionType(selectedSolute, concentration) === 'diluida' && '💧'}
                                        {calculateSolutionType(selectedSolute, concentration) === 'concentrada' && '🥤'}
                                        {calculateSolutionType(selectedSolute, concentration) === 'saturada' && '⚠️'}
                                    </div>
                                    <p className="font-semibold">
                                        Solución {calculateSolutionType(selectedSolute, concentration)}
                                    </p>
                                    {/* CORRECCIÓN 3: Se completa la etiqueta p en JSX */}
                                    <p className="text-sm text-gray-600">
                                        {selectedSolute} al {concentration}%
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-500">Selecciona un soluto en el panel de control.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Nuevo render para la pantalla de desafíos (CORRECCIÓN 4)
    const renderDesafios = () => (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
                <h1 className="text-3xl font-bold mb-6 text-purple-800">🎯 Desafíos del Maestro Químico</h1>
                <div className="space-y-4 mb-6">
                    {challenges.map((c, index) => (
                        <div key={c.id} className={`p-4 rounded-lg text-left ${index + 1 < currentChallenge ? 'bg-green-50 border-green-400' : index + 1 === currentChallenge ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'}`}>
                            <h3 className="font-semibold text-lg">{c.title}</h3>
                            <p className="text-sm text-gray-600">{c.description}</p>
                            <span className={`text-xs font-bold mt-1 inline-block ${index + 1 < currentChallenge ? 'text-green-600' : index + 1 === currentChallenge ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {index + 1 < currentChallenge ? '¡Completado! ✅' : index + 1 === currentChallenge ? 'Activo' : 'Bloqueado 🔒'}
                            </span>
                        </div>
                    ))}
                    {currentChallenge > challenges.length && (
                        <p className="text-xl font-bold text-blue-600 mt-4">¡Has completado todos los desafíos! 🎉</p>
                    )}
                </div>
                <button
                    onClick={() => setCurrentScreen('laboratorio')}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    ← Volver al Laboratorio
                </button>
            </div>
        </div>
    );

    // CORRECCIÓN 2: Se añade un componente para los elementos de audio
    const AudioElements = () => (
        <>
            {/* Las etiquetas de audio deben estar en el DOM */}
            <audio ref={backgroundMusicRef} src="/music/ambient-loop.mp3" loop />
            <audio ref={successSoundRef} src="/sounds/success.mp3" />
            <audio ref={errorSoundRef} src="/sounds/error.mp3" />
            <audio ref={pourSoundRef} src="/sounds/pour.mp3" />
        </>
    );

    // Renderizado principal (CORRECCIÓN 4: Se asegura que todos los estados se manejen)
    return (
        <>
            <AudioElements />
            <AnimatePresence mode="wait">
                {currentScreen === 'inicio' && renderInicio()}
                {currentScreen === 'tutorial' && renderTutorial()}
                {currentScreen === 'laboratorio' && renderLaboratorio()}
                {currentScreen === 'experimentacion' && renderExperimentacion()}
                {currentScreen === 'desafios' && renderDesafios()}
            </AnimatePresence>
        </>
    );
};

export default QuimicaMasterGame;