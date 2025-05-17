import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Quiz } from '@/models/Quiz';
import autoTable from 'jspdf-autotable';

// Nécessaire pour que TypeScript reconnaisse l'extension de jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface ExportOptions {
  includeQuestions?: boolean;
  includeAnswers?: boolean;
  includeParticipants?: boolean;
  includeStatistics?: boolean;
  includeLogo?: boolean;
  customHeader?: string;
  customFooter?: string;
  paperSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

const defaultOptions: ExportOptions = {
  includeQuestions: true,
  includeAnswers: false,
  includeParticipants: true,
  includeStatistics: true,
  includeLogo: true,
  paperSize: 'a4',
  orientation: 'portrait'
};

/**
 * Classe utilitaire pour générer des PDFs pour les quiz et leurs résultats
 */
export class PDFGenerator {
  /**
   * Génère un PDF pour un quiz
   */
  public static async generateQuizPDF(quiz: Quiz, options: ExportOptions = {}): Promise<jsPDF> {
    const opts = { ...defaultOptions, ...options };
    const doc = new jsPDF({
      orientation: opts.orientation,
      unit: 'mm',
      format: opts.paperSize
    });
    
    // Ajout du titre
    doc.setFontSize(22);
    doc.text(quiz.title, 14, 22);
    
    // Ajout des métadonnées
    doc.setFontSize(12);
    doc.text(`Créé par: ${quiz.creator?.username || 'Utilisateur'}`, 14, 32);
    doc.text(`Date de création: ${quiz.formatCreatedDate()}`, 14, 38);
    doc.text(`Catégorie: ${quiz.category}`, 14, 44);

    // Informations supplémentaires
    const infoY = 55;
    doc.setFontSize(11);
    if (quiz.description) {
      doc.text('Description:', 14, infoY);
      doc.setFontSize(10);
      const splitDescription = doc.splitTextToSize(quiz.description, 180);
      doc.text(splitDescription, 14, infoY + 6);
    }
    
    // Statistiques du quiz si demandées
    let currentY = infoY + (quiz.description ? 15 + Math.ceil(doc.splitTextToSize(quiz.description, 180).length * 5) : 15);
    
    if (opts.includeStatistics) {
      doc.setFontSize(16);
      doc.text('Statistiques', 14, currentY);
      currentY += 8;
      
      doc.setFontSize(11);
      doc.text(`Nombre total de questions: ${quiz.totalQuestions}`, 14, currentY);
      currentY += 6;
      
      if (quiz.totalParticipants > 0) {
        doc.text(`Nombre de participants: ${quiz.totalParticipants}`, 14, currentY);
        currentY += 6;
        
        if (quiz.avgScore !== null) {
          doc.text(`Score moyen: ${Math.round(quiz.avgScore)}%`, 14, currentY);
          currentY += 6;
        }
      }
      
      currentY += 10;
    }
    
    // Questions et réponses si demandées
    if (opts.includeQuestions) {
      doc.setFontSize(16);
      doc.text('Questions', 14, currentY);
      currentY += 10;
      
      const questions = quiz.questions;
      
      questions.forEach((question, index) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`Question ${index + 1}: ${question.text}`, 14, currentY);
        currentY += 8;
        
        if (opts.includeAnswers) {
          doc.setFontSize(10);
          question.answers.forEach((answer, ansIndex) => {
            const answerText = `${String.fromCharCode(97 + ansIndex)}. ${answer.text} ${answer.isCorrect ? ' (Correcte)' : ''}`;
            doc.text(answerText, 20, currentY);
            currentY += 6;
          });
          currentY += 4;
        }
        
        if (question.explanation && opts.includeAnswers) {
          doc.setFontSize(10);
          doc.text(`Explication: ${question.explanation}`, 20, currentY);
          currentY += 10;
        }
      });
    }
    
    // Participants si demandés
    if (opts.includeParticipants && quiz.participants.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Participants', 14, 20);
      
      const tableData = quiz.participants.map(participant => [
        participant.username,
        `${participant.score}%`,
        participant.completed ? 'Terminé' : 'En cours',
        new Date(participant.startedAt).toLocaleDateString('fr-FR')
      ]);
      
      doc.autoTable({
        head: [['Utilisateur', 'Score', 'Statut', 'Date de participation']],
        body: tableData,
        startY: 30
      });
    }
    
    // Ajout du pied de page
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`RTFM2Win - Page ${i} sur ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      
      if (opts.customFooter) {
        doc.text(opts.customFooter, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }
      
      // Ajout de la date d'exportation en bas à droite
      const exportDate = new Date().toLocaleDateString('fr-FR');
      doc.text(`Exporté le ${exportDate}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }
    
    return doc;
  }
  
  /**
   * Génère un PDF des résultats d'un participant
   */
  public static async generateResultsPDF(quiz: Quiz, participantId: string, options: ExportOptions = {}): Promise<jsPDF> {
    const opts = { ...defaultOptions, ...options };
    const doc = new jsPDF({
      orientation: opts.orientation,
      unit: 'mm',
      format: opts.paperSize
    });
    
    const participant = quiz.participants.find(p => p.id === participantId);
    
    if (!participant) {
      doc.setFontSize(16);
      doc.text('Participant non trouvé', 14, 22);
      return doc;
    }
    
    // Ajout du titre
    doc.setFontSize(20);
    doc.text(`Résultats: ${quiz.title}`, 14, 22);
    
    // Informations sur le participant
    doc.setFontSize(14);
    doc.text(`Participant: ${participant.username}`, 14, 35);
    doc.text(`Score: ${participant.score}%`, 14, 43);
    doc.text(`Date: ${new Date(participant.startedAt).toLocaleDateString('fr-FR')}`, 14, 51);
    
    if (participant.finishedAt) {
      const startTime = new Date(participant.startedAt);
      const endTime = new Date(participant.finishedAt);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);
      const durationSeconds = Math.floor((durationMs % 60000) / 1000);
      
      doc.text(`Durée: ${durationMinutes}m ${durationSeconds}s`, 14, 59);
    }
    
    // Ajout du pied de page
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`RTFM2Win - Page ${i} sur ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      
      if (opts.customFooter) {
        doc.text(opts.customFooter, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }
      
      // Ajout de la date d'exportation en bas à droite
      const exportDate = new Date().toLocaleDateString('fr-FR');
      doc.text(`Exporté le ${exportDate}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }
    
    return doc;
  }
  
  /**
   * Télécharge le PDF généré
   */
  public static downloadPDF(doc: jsPDF, filename: string): void {
    doc.save(filename);
  }
} 