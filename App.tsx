import React, { useState, useMemo } from 'react';
import { ScoreInput } from './components/ScoreInput';
import { RecommendationCard } from './components/RecommendationCard';
import { InfoModal } from './components/InfoModal';
import { 
  getSisuRecommendations, 
  getUnbRecommendations, 
  getProuniRecommendations, 
  getProuniDFRecommendations 
} from './services/geminiService';
import { EnemScores, CourseRecommendation } from './types';

// Icons
const IconPen = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>;
const IconBook = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
const IconGlobe = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const IconMath = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>;
const IconAtom = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>;
const IconFilter = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>;
const IconQuestion = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

type SystemType = 'sisu' | 'prouni';
type SubTabType = 'geral' | 'specific'; // Specific = UnB (for SISU) or DF (for ProUni)

export default function App() {
  const [scores, setScores] = useState<EnemScores>({
    redacao: 0,
    linguagens: 0,
    humanas: 0,
    natureza: 0,
    matematica: 0
  });

  const [activeSystem, setActiveSystem] = useState<SystemType>('sisu');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('geral');
  const [loading, setLoading] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  
  // Data States
  const [sisuGeral, setSisuGeral] = useState<CourseRecommendation[] | null>(null);
  const [sisuUnb, setSisuUnb] = useState<CourseRecommendation[] | null>(null);
  const [prouniGeral, setProuniGeral] = useState<CourseRecommendation[] | null>(null);
  const [prouniDf, setProuniDf] = useState<CourseRecommendation[] | null>(null);
  
  const [average, setAverage] = useState<number | null>(null);

  // Filter States
  const [filterUniversity, setFilterUniversity] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterChance, setFilterChance] = useState('');

  const handleScoreChange = (field: keyof EnemScores, value: number) => {
    setScores(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemChange = (system: SystemType) => {
    if (system === activeSystem) return;
    setActiveSystem(system);
    setActiveSubTab('geral'); // Reset subtab when switching system
    setFilterUniversity('');
    setFilterCourse('');
    setFilterChance('');
  };

  const getCurrentData = () => {
    if (activeSystem === 'sisu') {
        return activeSubTab === 'geral' ? sisuGeral : sisuUnb;
    } else {
        return activeSubTab === 'geral' ? prouniGeral : prouniDf;
    }
  };

  const currentData = getCurrentData();

  const calculateAndFetch = async (targetSubTab?: SubTabType) => {
    // Basic validation
    if (Object.values(scores).some(s => s === 0)) {
      alert("Por favor, preencha todas as notas para ter um resultado preciso (use valores aproximados se não souber a exata).");
      return;
    }

    const subTabToFetch = targetSubTab || activeSubTab;

    setLoading(true);
    setFilterUniversity('');
    setFilterCourse('');
    setFilterChance('');
    
    const simpleAvg = (scores.redacao + scores.linguagens + scores.humanas + scores.natureza + scores.matematica) / 5;
    setAverage(simpleAvg);

    // If fresh calculation via button (no target tab specified), clear relevant data
    if (!targetSubTab) {
        if (activeSystem === 'sisu') {
            setSisuGeral(null);
            setSisuUnb(null);
        } else {
            setProuniGeral(null);
            setProuniDf(null);
        }
    }

    try {
      let results;
      if (activeSystem === 'sisu') {
        if (subTabToFetch === 'geral') {
            results = await getSisuRecommendations(scores);
            setSisuGeral(results);
        } else {
            results = await getUnbRecommendations(scores);
            setSisuUnb(results);
        }
      } else {
        // PROUNI
        if (subTabToFetch === 'geral') {
            results = await getProuniRecommendations(scores);
            setProuniGeral(results);
        } else {
            results = await getProuniDFRecommendations(scores);
            setProuniDf(results);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao consultar as previsões. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubTabSwitch = (tab: SubTabType) => {
    if (tab === activeSubTab) return;
    setActiveSubTab(tab);
    
    setFilterUniversity('');
    setFilterCourse('');
    setFilterChance('');

    // If user has already calculated average, auto-fetch the new tab data if missing
    if (average !== null) {
        const needsFetch = activeSystem === 'sisu' 
            ? (tab === 'geral' ? !sisuGeral : !sisuUnb)
            : (tab === 'geral' ? !prouniGeral : !prouniDf);
            
        if (needsFetch) {
            calculateAndFetch(tab);
        }
    }
  };

  // Derived Filter Options
  const uniqueUniversities = useMemo(() => {
    if (!currentData) return [];
    const unis = currentData.map(r => r.university);
    return Array.from(new Set(unis)).sort();
  }, [currentData]);

  const uniqueCourses = useMemo(() => {
    if (!currentData) return [];
    const courses = currentData.map(r => r.course);
    return Array.from(new Set(courses)).sort();
  }, [currentData]);

  const uniqueChances = useMemo(() => {
    if (!currentData) return [];
    const chances = currentData.map(r => r.chance);
    return Array.from(new Set(chances));
  }, [currentData]);

  // Filter Logic
  const filteredRecommendations = useMemo(() => {
    if (!currentData) return null;
    return currentData.filter(rec => {
      const matchUni = filterUniversity ? rec.university === filterUniversity : true;
      const matchCourse = filterCourse ? rec.course === filterCourse : true;
      const matchChance = filterChance ? rec.chance === filterChance : true;
      return matchUni && matchCourse && matchChance;
    });
  }, [currentData, filterUniversity, filterCourse, filterChance]);

  const hasActiveFilters = filterUniversity || filterCourse || filterChance;

  const clearFilters = () => {
    setFilterUniversity('');
    setFilterCourse('');
    setFilterChance('');
  };

  // UI Helpers
  const isSisu = activeSystem === 'sisu';
  const specificTabLabel = isSisu ? 'Universidade de Brasília (UnB)' : 'Faculdades do DF';
  const buttonColor = isSisu ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700';
  const activeTabColor = isSisu ? 'border-blue-600 text-blue-600' : 'border-purple-600 text-purple-600';

  return (
    <div className="min-h-screen bg-[#f3f5f8] pb-20">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`${isSisu ? 'bg-blue-600' : 'bg-purple-600'} text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider transition-colors`}>Educação</span>
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Ferramenta Interativa</span>
                <button 
                  onClick={() => setInfoModalOpen(true)}
                  className="ml-2 text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-medium group"
                  title="Como funciona o cálculo?"
                >
                    <IconQuestion />
                    <span className="group-hover:underline">Entenda o cálculo</span>
                </button>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 serif mb-4 tracking-tight">
                Simulador do SISU da Júlia
              </h1>
            </div>
            
            <div className="hidden md:block text-right pt-2">
                 <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Desenvolvido por</p>
                 <p className="text-xs font-bold text-gray-600">Fabiano Ventura e Google Studio</p>
            </div>
          </div>

          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Insira suas notas do Enem e descubra suas chances no SISU (Universidades Públicas) ou ProUni (Bolsas em Particulares).
          </p>
          
          <p className="md:hidden mt-3 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            Desenvolvido por: Fabiano Ventura e Google Studio
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* System Selector Toggle */}
        <div className="flex justify-center mb-8">
            <div className="bg-gray-200 p-1 rounded-xl inline-flex shadow-inner">
                <button 
                    onClick={() => handleSystemChange('sisu')}
                    className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeSystem === 'sisu' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    SISU (Pública)
                </button>
                <button 
                    onClick={() => handleSystemChange('prouni')}
                    className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeSystem === 'prouni' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    ProUni (Bolsas)
                </button>
            </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 relative overflow-hidden">
          {/* Decorative stripe based on system */}
          <div className={`absolute top-0 left-0 w-full h-1 ${isSisu ? 'bg-blue-500' : 'bg-purple-500'}`}></div>

          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className={`w-1 h-6 rounded-full ${isSisu ? 'bg-blue-600' : 'bg-purple-600'}`}></span>
            Suas Notas no Enem
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScoreInput 
              label="Redação" 
              value={scores.redacao} 
              onChange={(v) => handleScoreChange('redacao', v)} 
              icon={<IconPen />}
              colorClass="focus:ring-pink-500 focus:border-pink-500"
            />
            <ScoreInput 
              label="Linguagens" 
              value={scores.linguagens} 
              onChange={(v) => handleScoreChange('linguagens', v)} 
              icon={<IconBook />}
              colorClass="focus:ring-orange-500 focus:border-orange-500"
            />
            <ScoreInput 
              label="Ciências Humanas" 
              value={scores.humanas} 
              onChange={(v) => handleScoreChange('humanas', v)} 
              icon={<IconGlobe />}
              colorClass="focus:ring-yellow-500 focus:border-yellow-500"
            />
            <ScoreInput 
              label="Matemática" 
              value={scores.matematica} 
              onChange={(v) => handleScoreChange('matematica', v)} 
              icon={<IconMath />}
              colorClass="focus:ring-blue-500 focus:border-blue-500"
            />
            <ScoreInput 
              label="Ciências da Natureza" 
              value={scores.natureza} 
              onChange={(v) => handleScoreChange('natureza', v)} 
              icon={<IconAtom />}
              colorClass="focus:ring-green-500 focus:border-green-500"
            />
            
            <div className="flex items-end">
              <button 
                onClick={() => calculateAndFetch()}
                disabled={loading}
                className={`w-full text-white font-bold py-3.5 px-6 rounded-lg shadow transition-colors duration-200 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculando...
                  </>
                ) : (
                  `Calcular ${isSisu ? 'SISU' : 'ProUni'}`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {(loading || currentData || average !== null) && (
          <div className="mt-8 animate-fade-in-up">
             {average && (
                <div className={`mb-6 flex items-center justify-between p-4 rounded-lg border ${isSisu ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                    <div>
                        <span className={`text-sm font-semibold block ${isSisu ? 'text-blue-800' : 'text-purple-800'}`}>Sua Média Simples</span>
                        <span className={`text-3xl font-bold serif ${isSisu ? 'text-blue-900' : 'text-purple-900'}`}>{average.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                        <span className={`text-xs ${isSisu ? 'text-blue-600' : 'text-purple-600'}`}>Baseado nas 5 notas informadas</span>
                    </div>
                </div>
             )}

            <div className="flex flex-col mb-6">
                <div className="border-b border-gray-300 flex space-x-6">
                    <button
                        onClick={() => handleSubTabSwitch('geral')}
                        className={`pb-3 text-lg font-bold transition-colors border-b-2 px-2 ${activeSubTab === 'geral' ? activeTabColor : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {isSisu ? 'Recomendações Gerais' : 'ProUni Nacional'}
                    </button>
                    <button
                        onClick={() => handleSubTabSwitch('specific')}
                        className={`pb-3 text-lg font-bold transition-colors border-b-2 px-2 ${activeSubTab === 'specific' ? activeTabColor : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {specificTabLabel}
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 serif">
                {loading ? 'Consultando IA...' : `Resultados Encontrados (${filteredRecommendations?.length || 0})`}
              </h2>
            </div>

            {/* Filter Bar */}
            {!loading && currentData && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold text-sm">
                  <IconFilter />
                  Filtrar Resultados
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  
                  {/* Hide University Filter if on Specific Tab (UnB or DF usually implies limited scope, but DF has multiple colleges so we keep it for DF) */}
                  {(activeSystem === 'prouni' || activeSubTab === 'geral') && (
                    <select 
                        value={filterUniversity} 
                        onChange={(e) => setFilterUniversity(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-gray-800 text-white"
                    >
                        <option value="">Todas as Universidades</option>
                        {uniqueUniversities.map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                        ))}
                    </select>
                  )}

                  <select 
                    value={filterCourse} 
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-gray-800 text-white"
                  >
                    <option value="">Todos os Cursos</option>
                    {uniqueCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>

                  <select 
                    value={filterChance} 
                    onChange={(e) => setFilterChance(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-gray-800 text-white"
                  >
                    <option value="">Todas as Chances</option>
                    {uniqueChances.map(chance => (
                      <option key={chance} value={chance}>{chance}</option>
                    ))}
                  </select>

                  {hasActiveFilters && (
                    <button 
                      onClick={clearFilters}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Limpar Filtros
                    </button>
                  )}
                </div>
              </div>
            )}

            {loading ? (
               <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white h-32 rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse flex flex-col justify-center">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                    </div>
                  ))}
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredRecommendations?.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <p className="text-gray-500">Nenhum resultado encontrado para os filtros selecionados.</p>
                    <button onClick={clearFilters} className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm">Limpar filtros</button>
                  </div>
                ) : (
                  filteredRecommendations?.map((rec, index) => (
                    <RecommendationCard key={index} data={rec} />
                  ))
                )}
              </div>
            )}

            {!loading && currentData && (
              <div className={`mt-6 p-4 text-sm rounded-lg border ${isSisu ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-purple-50 text-purple-900 border-purple-200'}`}>
                <strong>Atenção:</strong> {isSisu ? 
                    "Este simulador baseia-se em notas de corte históricas de universidades públicas (Federais/Estaduais)." : 
                    "Para o ProUni, as notas de corte referem-se a bolsas (Integrais ou Parciais) em universidades privadas."}
                {activeSubTab === 'specific' && isSisu && " Os pesos específicos da UnB podem alterar sua média final."}
                {activeSubTab === 'specific' && !isSisu && " Mostrando apenas faculdades do Distrito Federal."}
                 &nbsp;Consulte sempre os editais oficiais.
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="mt-20 border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
         <p className="mb-2 font-semibold text-gray-700">Simulador do SISU da Júlia</p>
         <p>© {new Date().getFullYear()} - Todos os direitos reservados.</p>
      </footer>

      {/* Info Modal */}
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setInfoModalOpen(false)} />
    </div>
  );
}