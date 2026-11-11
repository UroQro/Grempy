import React, { useState } from 'react';
import { savePatientData } from './firebase';

const GREMP_QUESTIONS = [
  {
    id: 'q1',
    label: 'qSOFA ≥ 2 (FR ≥22/min, alteración mental, TAS ≤100 mmHg)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 2 }]
  },
  {
    id: 'q2',
    label: 'Anemia (Hemoglobina < 12 g/dL)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  },
  {
    id: 'q3',
    label: 'Trombocitopenia (< 150,000 / µL)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  },
  {
    id: 'q4',
    label: 'Leucocitosis (> 22,000 / µL)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  },
  {
    id: 'q5',
    label: 'Hiperglucemia (> 200 mg/dL)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  },
  {
    id: 'q6',
    label: 'Gas pararrenal (Clase 3B de Huang y Tseng)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  }
];

export default function App() {
  const [step, setStep] = useState(1);
  const [patientInfo, setPatientInfo] = useState({ nombre: '', edad: '', sexo: '' });
  const [answers, setAnswers] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const handleInfoChange = (e) => setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value });
  const handleAnswerChange = (qId, points) => setAnswers({ ...answers, [qId]: points });

  const calculateScore = () => Object.values(answers).reduce((acc, curr) => acc + curr, 0);

  const getRiskClassification = (score) => {
    if (score <= 3) return { 
      risk: 'Riesgo Bajo (0-3 pts)', 
      desc: 'Mortalidad esperada: 3.8%. VPN 96.2%. Puede apoyar manejo en hospitalización general con vigilancia estrecha.' 
    };
    if (score <= 5) return { 
      risk: 'Riesgo Intermedio (4-5 pts)', 
      desc: 'Mortalidad esperada: 15.4%. Requiere vigilancia clínica más estrecha y reevaluación frecuente.' 
    };
    return { 
      risk: 'Riesgo Alto (6-7 pts)', 
      desc: 'Mortalidad esperada: 62.5%. Justifica valoración inmediata por Medicina Crítica, reanimación agresiva y control temprano del foco.' 
    };
  };

  const submitData = async () => {
    setIsSaving(true);
    const score = calculateScore();
    const dataToSave = {
      ...patientInfo,
      gremp_score: score,
      answers,
      risk_classification: getRiskClassification(score).risk
    };
    
    const result = await savePatientData(dataToSave);
    if (result.success) {
      setSaveSuccess(true);
    } else {
      setSaveSuccess(false);
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setStep(1);
    setPatientInfo({ nombre: '', edad: '', sexo: '' });
    setAnswers({});
    setSaveSuccess(null);
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Grempy PNE</h1>
          <p className="text-sm text-gray-500">Clasificación GREMP (Hospital Metropolitano)</p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Paciente</label>
              <input type="text" name="nombre" value={patientInfo.nombre} onChange={handleInfoChange} className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nombre completo" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Edad</label>
                <input type="number" name="edad" value={patientInfo.edad} onChange={handleInfoChange} className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Sexo</label>
                <select name="sexo" value={patientInfo.sexo} onChange={handleInfoChange} className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => { if (patientInfo.nombre && patientInfo.edad && patientInfo.sexo) setStep(2); }} 
              disabled={!patientInfo.nombre || !patientInfo.edad || !patientInfo.sexo}
              className="w-full mt-4 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b pb-2">Variables GREMP</h2>
            {GREMP_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="font-medium text-gray-800">{q.label}</p>
                <div className="flex gap-4">
                  {q.options.map((opt, idx) => (
                    <label key={idx} className="flex-1 flex items-center justify-center space-x-2 bg-gray-50 p-2 rounded-md border cursor-pointer hover:bg-gray-100">
                      <input 
                        type="radio" 
                        name={q.id} 
                        value={opt.points} 
                        checked={answers[q.id] === opt.points}
                        onChange={() => handleAnswerChange(q.id, opt.points)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="text-sm text-gray-700">{opt.text} ({opt.points} pts)</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="w-1/3 bg-gray-300 text-gray-800 font-semibold py-2 rounded-md hover:bg-gray-400">
                Atrás
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={Object.keys(answers).length !== GREMP_QUESTIONS.length}
                className="w-2/3 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Evaluar Mortalidad
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold">Resultados de Ingreso</h2>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
              <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Puntaje GREMP</p>
              <p className="text-6xl font-black text-blue-700 my-3">{calculateScore()}</p>
              
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <p className="text-lg font-bold text-gray-800">{getRiskClassification(calculateScore()).risk}</p>
                <p className="text-sm text-gray-600 mt-1">{getRiskClassification(calculateScore()).desc}</p>
              </div>
              <p className="text-xs text-gray-400 mt-4 italic">*No predice falla a manejo mínimamente invasivo ni necesidad de nefrectomía.</p>
            </div>

            {saveSuccess === null ? (
              <button 
                onClick={submitData} 
                disabled={isSaving}
                className="w-full mt-4 bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Registrar Paciente en BD'}
              </button>
            ) : saveSuccess ? (
              <div className="p-3 bg-green-100 text-green-700 rounded-md font-medium">
                ¡Paciente registrado exitosamente!
              </div>
            ) : (
              <div className="p-3 bg-red-100 text-red-700 rounded-md font-medium">
                Error de conexión. Verifica la configuración de Firebase.
              </div>
            )}
            
            <button onClick={resetForm} className="w-full mt-2 bg-gray-200 text-gray-800 font-semibold py-2 rounded-md hover:bg-gray-300">
              Nuevo Paciente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
