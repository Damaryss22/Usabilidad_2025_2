import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from './chatbot.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  isOpen = false;
  userInput = '';
  messages: ChatMessage[] = [
    {
      text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? Puedo generar cuestionarios o planes de estudio.",
      isUser: false,
      timestamp: new Date()
    }
  ];
  isLoading = false;

  constructor(private chatbotService: ChatbotService, private sanitizer: DomSanitizer) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  formatMessage(text: string): SafeHtml {
    // Reemplazar saltos de línea con <br>
    let formatted = text.replace(/\n/g, '<br>');
    
    // Detectar URLs y convertirlas en enlaces
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formatted = formatted.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">${url}</a>`;
    });

    // Detectar formato Markdown básico para negrita (**texto**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Detectar formato Markdown básico para listas (* item)
    formatted = formatted.replace(/^\* (.*$)/gm, '• $1');

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMsg: ChatMessage = {
      text: this.userInput,
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMsg);
    const currentInput = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    this.chatbotService.sendMessage(currentInput).subscribe({
      next: (response) => {
        this.messages.push(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.messages.push({
          text: "Lo siento, ocurrió un error inesperado.",
          isUser: false,
          timestamp: new Date()
        });
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
