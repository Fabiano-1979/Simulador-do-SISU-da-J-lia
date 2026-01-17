import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EnemScores, CourseRecommendation, ChanceLevel } from "../types";

// Initialize the Gemini client
// Note: In a production environment, never expose your API key on the client side.
// Since this is a demo structure based on instructions, we rely on the injected process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      university: { type: Type.STRING, description: "Nome da universidade/faculdade" },
      course: { type: Type.STRING, description: "Nome do curso" },
      location: { type: Type.STRING, description: "Cidade e Estado" },
      cutoffEstimate: { type: Type.NUMBER, description: "Nota de corte estimada" },
      chance: { 
        type: Type.STRING, 
        enum: ["Muito Alta", "Alta", "Média", "Baixa"],
        description: "Probabilidade de passar/conseguir bolsa"
      },
      shift: { type: Type.STRING, description: "Turno e Tipo de Bolsa (ex: Integral - Noturno)" }
    },
    required: ["university", "course", "location", "cutoffEstimate", "chance", "shift"]
  }
};

const calculateAverage = (scores: EnemScores) => {
  return (
    scores.humanas +
    scores.natureza +
    scores.linguagens +
    scores.matematica +
    scores.redacao
  ) / 5;
};

// --- SISU FUNCTIONS ---

export const getSisuRecommendations = async (scores: EnemScores): Promise<CourseRecommendation[]> => {
  const average = calculateAverage(scores);

  const prompt = `
    Atue como um especialista no SISU (Sistema de Seleção Unificada).
    
    Dados do Aluno (Média: ${average.toFixed(2)}):
    - Nat: ${scores.natureza}, Hum: ${scores.humanas}, Ling: ${scores.linguagens}, Mat: ${scores.matematica}, Red: ${scores.redacao}

    Tarefa:
    Forneça uma lista de 30 cursos em Universidades Públicas (Federais/Estaduais) realistas para este aluno.
    Varie regiões e cursos.
    
    Retorne JSON conforme schema.
  `;

  return fetchFromGemini(prompt);
};

export const getUnbRecommendations = async (scores: EnemScores): Promise<CourseRecommendation[]> => {
  const average = calculateAverage(scores);

  const prompt = `
    Atue como um especialista no SISU, focando EXCLUSIVAMENTE na Universidade de Brasília (UnB).
    
    Dados do Aluno (Média: ${average.toFixed(2)}):
    - Nat: ${scores.natureza}, Hum: ${scores.humanas}, Ling: ${scores.linguagens}, Mat: ${scores.matematica}, Red: ${scores.redacao}

    Tarefa:
    Liste 25 cursos variados da UnB (todos os campi: Darcy, Planaltina, Gama, Ceilândia).
    Inclua chances variadas (Baixa a Muito Alta).
    
    Retorne JSON conforme schema.
  `;

  return fetchFromGemini(prompt);
};

// --- PROUNI FUNCTIONS ---

export const getProuniRecommendations = async (scores: EnemScores): Promise<CourseRecommendation[]> => {
  const average = calculateAverage(scores);

  const prompt = `
    Atue como um especialista no ProUni (Programa Universidade para Todos).
    
    Dados do Aluno (Média: ${average.toFixed(2)}):
    - Nat: ${scores.natureza}, Hum: ${scores.humanas}, Ling: ${scores.linguagens}, Mat: ${scores.matematica}, Red: ${scores.redacao}

    Tarefa:
    Forneça uma lista de 30 opções de cursos em Universidades PARTICULARES (Privadas) em todo o Brasil que aceitam ProUni.
    Considere bolsas Integrais (100%) e Parciais (50%) baseando-se no histórico de notas de corte.
    
    No campo "shift", especifique se a bolsa é Integral ou Parcial e o turno.
    
    Retorne JSON conforme schema.
  `;

  return fetchFromGemini(prompt);
};

export const getProuniDFRecommendations = async (scores: EnemScores): Promise<CourseRecommendation[]> => {
  const average = calculateAverage(scores);

  const prompt = `
    Atue como um especialista no ProUni, focando EXCLUSIVAMENTE em faculdades do DISTRITO FEDERAL (DF).
    
    Dados do Aluno (Média: ${average.toFixed(2)}):
    - Nat: ${scores.natureza}, Hum: ${scores.humanas}, Ling: ${scores.linguagens}, Mat: ${scores.matematica}, Red: ${scores.redacao}

    Tarefa:
    Liste 25 cursos em faculdades particulares de Brasília/DF (ex: CEUB, UCB, IESB, UPIS, etc) disponíveis no ProUni.
    Considere bolsas Integrais e Parciais.
    
    Retorne JSON conforme schema.
  `;

  return fetchFromGemini(prompt);
};

const fetchFromGemini = async (prompt: string): Promise<CourseRecommendation[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text) as any[];
    
    return data.map((item: any) => ({
      ...item,
      chance: item.chance as ChanceLevel
    }));

  } catch (error) {
    console.error("Erro ao consultar o Gemini:", error);
    throw new Error("Não foi possível obter as recomendações no momento.");
  }
};