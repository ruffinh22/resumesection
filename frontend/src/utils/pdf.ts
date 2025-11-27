import { ActivityReport, ExportConfig } from '../types';

export const generatePDF = async (
  reports: ActivityReport[], 
  config: ExportConfig
): Promise<void> => {
  try {
    // Simuler la génération PDF (en production, utiliser jsPDF ou une API)
    const doc = createPDFContent(reports, config);
    const blob = new Blob([doc], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-eglise-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Impossible de générer le PDF');
  }
};

const createPDFContent = (reports: ActivityReport[], config: ExportConfig): string => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} €`;
  };
  let content = `RAPPORT D'ACTIVITÉS DE L'ÉGLISE\n=======================================\n\nGénéré le: ${formatDate(new Date().toISOString())}\nPériode: ${config.startDate ? formatDate(config.startDate) : 'Début'} - ${config.endDate ? formatDate(config.endDate) : 'Fin'}\nSection: ${config.section === 'all' ? 'Toutes les sections' : config.section}\n\n`;
  if (config.includeStats) {
    const totalReports = reports.length;
    const totalFaithful = reports.reduce((sum, report) => sum + report.totalFaithful, 0);
    const totalOffering = reports.reduce((sum, report) => sum + report.offering, 0);
    const activeSections = new Set(reports.map(report => report.sectionName)).size;
    content += `STATISTIQUES GÉNÉRALES\n=====================\n\nNombre total de rapports: ${totalReports}\nTotal des fidèles: ${totalFaithful}\nTotal des quêtes: ${formatCurrency(totalOffering)}\nSections actives: ${activeSections}\n\n`;
  }
  if (config.includeDetails && reports.length > 0) {
    content += `DÉTAILS DES RAPPORTS\n==================\n\n`;
    reports.forEach((report, index) => {
      content += `${index + 1}. ${formatDate(report.date)} - ${report.sectionName}\n   Prédicateur: ${report.preacher}\n   Fidèles: ${report.totalFaithful} (H:${report.menCount} F:${report.womenCount} E:${report.childrenCount} J:${report.youthCount})\n   Quête: ${formatCurrency(report.offering)}\n   Soumis par: ${report.submittedBy}`;
      if (config.includeNotes && report.notes) {
        content += `\n   Notes: ${report.notes}`;
      }
      content += `\n\n`;
    });
  }
  return content;
};
