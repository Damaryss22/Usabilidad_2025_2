import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout, retry } from 'rxjs/operators';

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
  resources?: Resource[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'document';
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  // ---------------------------------------------------------
  // CONFIGURACIÓN DE LA API DEL CHATBOT (Google Gemini)
  // ---------------------------------------------------------
  // URL para Google Gemini (Modelo Flash 2.0 - Actualizado)
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'; 
  
  // Tu API KEY de Google
  private apiKey = 'AIzaSyBQ5QmN4FbuhN2kbQ8IPpjjYJgSIUBev0A';
  
  // Usamos la API real
  private useMock = false;
  // ---------------------------------------------------------

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatMessage> {
    // 1. Si está activado el modo mock, usamos la respuesta simulada
    if (this.useMock) {
      return this.mockResponse(message);
    }

    // 2. Configuración para Google Gemini
    const url = `${this.apiUrl}?key=${this.apiKey}`;
    
    const body = {
      contents: [{
        parts: [{ text: message }]
      }]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(url, body, { headers }).pipe(
      timeout(45000), // Aumentamos el timeout a 45 segundos (los modelos pueden tardar)
      retry(1),       // Reintentamos una vez si hay error de red
      map(response => {
        // Extraer respuesta de Gemini
        let botText = "No pude entender eso.";
        if (response.candidates && response.candidates.length > 0) {
          botText = response.candidates[0].content.parts[0].text;
        }
        
        return {
          text: botText,
          isUser: false,
          timestamp: new Date()
        };
      }),
      catchError(error => {
        console.error('Error en el chatbot (API):', error);
        // Fallback: Si falla la API, usamos el mock para no dejar al usuario tirado
        return this.mockResponse(message);
      })
    );
  }

  private mockResponse(message: string): Observable<ChatMessage> {
    // Simulación de respuestas inteligentes
    let responseText = "";
    let resources: Resource[] = [];

    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('cuestionario') || lowerMsg.includes('examen')) {
      responseText = "Claro, puedo ayudarte a generar un cuestionario. ¿Para qué materia necesitas practicar? Puedo crear preguntas de opción múltiple o desarrollo.";
    } else if (lowerMsg.includes('plan de estudio') || lowerMsg.includes('estudiar')) {
      responseText = "Entendido. Para crear un plan de estudio efectivo, necesito saber: \n1. La materia.\n2. Cuánto tiempo tienes disponible.\n3. Tus temas más difíciles.";
      resources = [
        { title: "Técnica Pomodoro para estudiar", url: "https://www.youtube.com/watch?v=12345", type: "video" },
        { title: "Guía de organización", url: "https://ejemplo.com/guia", type: "document" }
      ];
    } else if (lowerMsg.includes('ayuda') || lowerMsg.includes('sistema')) {
      responseText = "Soy el asistente virtual del sistema. Puedo ayudarte a navegar por las opciones, encontrar materiales o generar ayudas de estudio.";
    } else {
      responseText = "Interesante. Cuéntame más sobre eso o especifica si necesitas ayuda con alguna materia en particular.";
    }

    return of({
      text: responseText,
      isUser: false,
      timestamp: new Date(),
      resources: resources.length > 0 ? resources : undefined
    }); // Simulamos un pequeño delay si quisiéramos con delay(1000)
  }
}
