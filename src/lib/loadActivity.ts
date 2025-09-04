import { Activity, ActivitySchema } from '../types/activity';

export async function loadActivity(configPath: string): Promise<Activity> {
  try {
    const response = await fetch(configPath);
    
    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo: ${response.status} ${response.statusText}`);
    }
    
    const json = await response.json();
    
    // Validate with Zod
    const validatedActivity = ActivitySchema.parse(json);
    
    return validatedActivity;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`No se pudo cargar la actividad: ${error.message}`);
    }
    throw new Error('Error desconocido al cargar la actividad');
  }
}