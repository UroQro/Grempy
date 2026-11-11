import React, { useState, useEffect } from 'react';
import { savePatientData } from './firebase';

const GREMP_QUESTIONS = [
  {
    id: 'q1',
    title: 'qSOFA ≥ 2',
    subtitle: 'FR ≥22/min, alteración mental, TAS ≤100 mmHg',
    label: 'qSOFA ≥ 2 (FR ≥22/min, alteración mental, TAS ≤100 mmHg)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 2 }]
  },
  {
    id: 'q2',
    title: 'Anemia',
    subtitle: 'Hemoglobina < 12 g/dL',
    label: 'Anemia (Hemoglobina < 12 g/dL)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  },
  {
    id: 'q3',
    title: 'Trombocitopenia',
    subtitle: 'Plaquetas < 150,000 / µL',
    label: 'Trombocitopenia (< 150,000 / µL)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  },
  {
    id: 'q4',
    title: 'Leucocitosis',
    subtitle: 'Leucocitos > 22,000 / µL',
    label: 'Leucocitosis (> 22,000 / µL)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  },
  {
    id: 'q5',
    title: 'Hiperglucemia',
    subtitle: 'Glucosa > 200 mg/dL',
    label: 'Hiperglucemia (> 200 mg/dL)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  },
  {
    id: 'q6',
    title: 'Gas pararrenal',
    subtitle: 'Clase 3B de Huang y Tseng',
    label: 'Gas pararrenal (Clase 3B de Huang y Tseng)',
    options: [{ text: 'No', points: 0 }, { text: 'Sí', points: 1 }]
  }
];

const STEPS = [
  { id: 1, label: 'Paciente' },
  { id: 2, label: 'Variables' },
  { id: 3, label: 'Resultado' }
];

export default function App() {
  const [step, setStep] = useState(1);
  const [patientInfo, setPatientInfo] = useState({
    nombre: '',
    edad: '',
    sexo: '',
    diabetico_conocido: ''
  });
  const [answers, setAnswers] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleInfoChange = (e) => setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value });
  const handleFieldSelect = (field, value) => setPatientInfo({ ...patientInfo, [field]: value });
  const handleAnswerChange = (qId, points) => setAnswers({ ...answers, [qId]: points });

  const calculateScore = () => Object.values(answers).reduce((acc, curr) => acc + curr, 0);

  const getRiskClassification = (score) => {
    if (score <= 3) return {
      risk: 'Riesgo Bajo (0-3 pts)',
      level: 'low',
      mortality: '3.8%',
      desc: 'Mortalidad esperada: 3.8%. VPN 96.2%. Puede apoyar manejo en hospitalización general con vigilancia estrecha.',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      cardClass: 'from-emerald-950/50 via-slate-900/90 to-slate-900/90 border-emerald-500/30 shadow-emerald-950/30',
      scoreClass: 'text-emerald-400',
      barClass: 'bg-gradient-to-r from-emerald-500 to-teal-400'
    };
    if (score <= 5) return {
      risk: 'Riesgo Intermedio (4-5 pts)',
      level: 'medium',
      mortality: '15.4%',
      desc: 'Mortalidad esperada: 15.4%. Requiere vigilancia clínica más estrecha y reevaluación frecuente.',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      cardClass: 'from-amber-950/50 via-slate-900/90 to-slate-900/90 border-amber-500/30 shadow-amber-950/30',
      scoreClass: 'text-amber-400',
      barClass: 'bg-gradient-to-r from-amber-500 to-orange-400'
    };
    return {
      risk: 'Riesgo Alto (6-7 pts)',
      level: 'high',
      mortality: '62.5%',
      desc: 'Mortalidad esperada: 62.5%. Justifica valoración inmediata por Medicina Crítica, reanimación agresiva y control temprano del foco.',
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      cardClass: 'from-rose-950/60 via-slate-900/90 to-slate-900/90 border-rose-500/40 shadow-rose-950/40',
      scoreClass: 'text-rose-400',
      barClass: 'bg-gradient-to-r from-rose-500 to-red-500'
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
    setPatientInfo({ nombre: '', edad: '', sexo: '', diabetico_conocido: '' });
    setAnswers({});
    setSaveSuccess(null);
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = GREMP_QUESTIONS.length;
  const isStep1Valid =
    patientInfo.nombre.trim() !== '' &&
    patientInfo.edad !== '' &&
    patientInfo.sexo !== '' &&
    patientInfo.diabetico_conocido !== '';
  const isStep2Valid = answeredCount === totalQuestions;
  const currentScore = calculateScore();
  const riskInfo = getRiskClassification(currentScore);

  return (
    <div className="min-h-[100dvh] px-3.5 py-6 sm:py-10 flex flex-col items-center justify-start sm:justify-center">
      <div className="w-full max-w-lg">
        {/* Main Glass Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl shadow-black/60 p-5 sm:p-7 transition-all duration-300">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Calculadora Clínica
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Grempy PNE
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Clasificación GREMP (Hospital Metropolitano)
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="mb-7">
            <div className="grid grid-cols-3 gap-2">
              {STEPS.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div key={s.id} className="flex flex-col items-center">
                    <div className="w-full flex items-center gap-1.5 mb-1.5">
                      <div
                        className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-sm shadow-blue-500/50'
                            : isDone
                            ? 'bg-blue-500/60'
                            : 'bg-slate-800'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium tracking-wide transition-colors ${
                        isActive
                          ? 'text-blue-400 font-semibold'
                          : isDone
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {s.id}. {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1: Patient Info */}
          {step === 1 && (
            <div key="step1" className="space-y-5 animate-step">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Nombre del Paciente
                </label>
                <input
                  type="text"
                  name="nombre"
                  autoComplete="off"
                  value={patientInfo.nombre}
                  onChange={handleInfoChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3.5 text-base text-slate-100 placeholder-slate-500 outline-none transition-all"
                  placeholder="Nombre completo o iniciales"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Edad (años)
                  </label>
                  <input
                    type="number"
                    name="edad"
                    inputMode="numeric"
                    min="0"
                    max="120"
                    value={patientInfo.edad}
                    onChange={handleInfoChange}
                    placeholder="Ej. 54"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3.5 text-base text-slate-100 placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Sexo
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { value: 'M', label: 'Masculino' },
                      { value: 'F', label: 'Femenino' }
                    ].map((item) => {
                      const selected = patientInfo.sexo === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleFieldSelect('sexo', item.value)}
                          className={`py-3.5 px-3 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97] ${
                            selected
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-inner shadow-blue-500/10'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  ¿El paciente ya se conocía diabético?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { value: 'No', label: 'No' },
                    { value: 'Sí', label: 'Sí' }
                  ].map((item) => {
                    const selected = patientInfo.diabetico_conocido === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => handleFieldSelect('diabetico_conocido', item.value)}
                        className={`py-3.5 px-3 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97] ${
                          selected
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-inner shadow-blue-500/10'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (isStep1Valid) setStep(2);
                  }}
                  disabled={!isStep1Valid}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none flex items-center justify-center gap-2 text-base"
                >
                  <span>Siguiente</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GREMP Questions */}
          {step === 2 && (
            <div key="step2" className="space-y-5 animate-step">
              {/* Sticky mobile subheader with live progress */}
              <div className="sticky top-2 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3.5 shadow-lg shadow-black/40 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Variables GREMP</h2>
                  <p className="text-xs text-slate-400">
                    Respondidas: <span className="text-blue-400 font-semibold">{answeredCount}</span> de {totalQuestions}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <span className="text-xs text-slate-400">Puntaje:</span>
                  <span className="text-base font-extrabold text-blue-400">{currentScore}</span>
                  <span className="text-[11px] text-slate-500">pts</span>
                </div>
              </div>

              <div className="space-y-3.5">
                {GREMP_QUESTIONS.map((q, index) => {
                  const isAnswered = answers[q.id] !== undefined;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 ${
                        isAnswered
                          ? 'bg-slate-950/70 border-slate-800/90'
                          : 'bg-slate-950/40 border-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                              {index + 1}
                            </span>
                            <p className="font-bold text-slate-100 text-sm sm:text-base">
                              {q.title}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 pl-7">
                            {q.subtitle}
                          </p>
                        </div>
                        {q.options[1].points > 1 && (
                          <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            +{q.options[1].points} pts
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {q.options.map((opt, idx) => {
                          const isSelected = answers[q.id] === opt.points;
                          const isPositive = opt.points > 0;
                          return (
                            <label
                              key={idx}
                              className={`relative flex items-center justify-center gap-2 py-3 px-3 rounded-xl border cursor-pointer select-none transition-all active:scale-[0.97] ${
                                isSelected
                                  ? isPositive
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-sm shadow-blue-500/10'
                                    : 'bg-slate-800/90 border-slate-600 text-slate-100'
                                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={opt.points}
                                checked={isSelected}
                                onChange={() => handleAnswerChange(q.id, opt.points)}
                                className="sr-only"
                              />
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                                  isSelected
                                    ? isPositive
                                      ? 'border-blue-400 bg-blue-500 text-white'
                                      : 'border-slate-300 bg-slate-300 text-slate-900'
                                    : 'border-slate-600 bg-transparent'
                                }`}
                              >
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                )}
                              </span>
                              <span className="text-sm font-semibold">
                                {opt.text}{' '}
                                <span className="text-xs font-normal opacity-75">
                                  ({opt.points} {opt.points === 1 ? 'pt' : 'pts'})
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-slate-800/90 hover:bg-slate-800 text-slate-200 font-semibold py-3.5 rounded-xl border border-slate-700/70 active:scale-[0.98] transition-all text-sm sm:text-base"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="w-2/3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none text-sm sm:text-base"
                >
                  Evaluar Mortalidad
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Results */}
          {step === 3 && (
            <div key="step3" className="space-y-5 text-center animate-step">
              {/* Patient Summary Pill */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-white">{patientInfo.nombre}</span>
                <span className="text-slate-600">•</span>
                <span>{patientInfo.edad} años</span>
                <span className="text-slate-600">•</span>
                <span>{patientInfo.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                <span className="text-slate-600">•</span>
                <span>DM previa: {patientInfo.diabetico_conocido}</span>
              </div>

              <div
                className={`p-5 sm:p-6 bg-gradient-to-b ${riskInfo.cardClass} rounded-2xl border shadow-xl transition-all`}
              >
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                  Puntaje GREMP
                </p>
                <div className="my-3 flex items-baseline justify-center gap-1.5">
                  <span className={`text-6xl sm:text-7xl font-black tracking-tight ${riskInfo.scoreClass}`}>
                    {currentScore}
                  </span>
                  <span className="text-lg font-semibold text-slate-500">/ 7</span>
                </div>

                {/* Score Bar */}
                <div className="w-full h-2 bg-slate-950/80 rounded-full overflow-hidden my-4 border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${riskInfo.barClass}`}
                    style={{ width: `${Math.max((currentScore / 7) * 100, 6)}%` }}
                  />
                </div>

                <div className="mt-4 p-4 bg-slate-950/75 rounded-xl border border-slate-800/90 text-left">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${riskInfo.badgeClass}`}
                    >
                      {riskInfo.risk}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Mortalidad: <strong className="text-slate-200">{riskInfo.mortality}</strong>
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mt-2">
                    {riskInfo.desc}
                  </p>
                </div>

                <p className="text-[11px] text-slate-400/80 mt-4 italic leading-normal">
                  *No predice falla a manejo mínimamente invasivo ni necesidad de nefrectomía.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                {saveSuccess === null ? (
                  <button
                    onClick={submitData}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Registrar Paciente en BD</span>
                      </>
                    )}
                  </button>
                ) : saveSuccess ? (
                  <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>¡Paciente registrado exitosamente!</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl font-medium text-sm">
                    Error de conexión. Verifica la configuración de Firebase.
                  </div>
                )}

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold py-3 rounded-xl border border-slate-700/70 active:scale-[0.98] transition-all text-sm"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-2/3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-3 rounded-xl border border-slate-700 active:scale-[0.98] transition-all text-sm"
                  >
                    Nuevo Paciente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
