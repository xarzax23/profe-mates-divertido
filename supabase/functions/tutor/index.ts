import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const parentPin = Deno.env.get('PARENT_PIN') || '1234';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

interface TutorRequest {
  grade: number;
  message?: string;
  imageUrl?: string;
  requestSolution?: boolean;
  parentPin?: string;
}

interface TutorResponse {
  pistas: string[];
  pasos: string[];
  repregunta: string;
  solucion?: string;
}

const systemPrompt = (grade: number) => `Actúas como un profesor de matemáticas para ${grade}º de Primaria. Tu respuesta DEBE ser exclusivamente un objeto JSON válido con las siguientes claves:

{
  "pistas": ["array de 2-3 pistas cortas y útiles"],
  "pasos": ["array de pasos sugeridos paso a paso"],
  "repregunta": "una pregunta para verificar comprensión",
  "solucion": "la solución completa y explicación final"
}

IMPORTANTE:
- Adapta la dificultad a ${grade}º de Primaria
- Usa un tono amable y motivador
- Si hay una imagen, describe brevemente lo que ves y extrae el ejercicio
- Las pistas deben guiar sin dar la respuesta directa
- Los pasos deben ser claros y secuenciales
- La repregunta debe verificar comprensión del concepto
- La solución debe ser completa pero fácil de entender
- NO incluyas texto fuera del JSON
- NO uses markdown ni formato especial, solo texto plano en las strings`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { grade, message, imageUrl, requestSolution, parentPin: providedPin }: TutorRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt(grade) }
    ];

    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: message || 'Ayúdame con este ejercicio de la imagen' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    } else if (message) {
      messages.push({
        role: 'user',
        content: message
      });
    } else {
      throw new Error('Se requiere mensaje o imagen');
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let tutorResponse: TutorResponse;
    try {
      tutorResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      throw new Error('Invalid response format from AI');
    }

    // Validate required fields
    if (!tutorResponse.pistas || !tutorResponse.pasos || !tutorResponse.repregunta) {
      throw new Error('Invalid response structure from AI');
    }


    // Always provide a 'reply' field for frontend compatibility
    let reply = '';
    if (tutorResponse.pistas && tutorResponse.pistas.length > 0) {
      reply = tutorResponse.pistas[0];
    } else if (tutorResponse.repregunta) {
      reply = tutorResponse.repregunta;
    } else if (tutorResponse.pasos && tutorResponse.pasos.length > 0) {
      reply = tutorResponse.pasos[0];
    } else {
      reply = 'No se pudo generar una respuesta.';
    }

    // Handle parental gate for solution
    if (requestSolution) {
      if (providedPin !== parentPin) {
        console.log('Invalid PIN attempt');
        delete tutorResponse.solucion;
        return new Response(JSON.stringify({ 
          ...tutorResponse, 
          reply,
          error: 'PIN incorrecto' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log('PIN validated successfully');
    } else {
      // Remove solution if not requested
      delete tutorResponse.solucion;
    }

    return new Response(JSON.stringify({ ...tutorResponse, reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in tutor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error interno del servidor',
      pistas: ['Hubo un problema técnico. Intenta reformular tu pregunta.'],
      pasos: ['Verifica que tu pregunta sea clara'],
      repregunta: '¿Puedes intentar preguntar de otra manera?',
      reply: 'Hubo un problema técnico. Intenta reformular tu pregunta.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});