import { useState, useCallback } from 'react';

/**
 * Résultat de la validation d'un PDF
 */
export interface PDFValidationResult {
  isValid: boolean;
  size: number;
  mimeType: string;
  hasPDFSignature: boolean;
  hasEOFMarker: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Options de validation personnalisées
 */
export interface PDFValidationOptions {
  minSize?: number;
  maxSize?: number;
  checkSignature?: boolean;
  checkEOF?: boolean;
  checkMimeType?: boolean;
}

const DEFAULT_OPTIONS: Required<PDFValidationOptions> = {
  minSize: 100,
  maxSize: 50 * 1024 * 1024, // 50 MB
  checkSignature: true,
  checkEOF: true,
  checkMimeType: true,
};

/**
 * Hook pour valider les fichiers PDF
 * Vérifie : signature PDF, marqueurs EOF, taille, type MIME
 */
export const usePDFValidator = () => {
  const [validationResult, setValidationResult] = useState<PDFValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Convertit un Blob en ArrayBuffer
   */
  const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  };

  /**
   * Vérifie si le fichier a la signature PDF (bytes initiaux)
   * Les fichiers PDF doivent commencer par: %PDF-1.x
   */
  const hasPDFSignature = (buffer: ArrayBuffer): boolean => {
    const view = new Uint8Array(buffer);
    if (view.length < 5) return false;

    const signature = String.fromCharCode(
      view[0],
      view[1],
      view[2],
      view[3],
      view[4]
    );
    
    return signature === '%PDF-';
  };

  /**
   * Vérifie si le fichier a le marqueur EOF (%%EOF à la fin)
   */
  const hasEOFMarker = (buffer: ArrayBuffer): boolean => {
    const view = new Uint8Array(buffer);
    if (view.length < 5) return false;

    // Chercher %%EOF dans les derniers 100 bytes
    const searchStart = Math.max(0, view.length - 100);
    const searchBuffer = Buffer.from(view.slice(searchStart)).toString('binary');
    
    return searchBuffer.includes('%%EOF');
  };

  /**
   * Valide un fichier PDF complet
   */
  const validatePDF = useCallback(
    async (file: Blob, options?: PDFValidationOptions): Promise<PDFValidationResult> => {
      setIsValidating(true);
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const result: PDFValidationResult = {
        isValid: true,
        size: file.size,
        mimeType: file.type,
        hasPDFSignature: false,
        hasEOFMarker: false,
        errors: [],
        warnings: [],
      };

      try {
        // Vérification 1 : Type MIME
        if (opts.checkMimeType) {
          if (file.type && file.type !== 'application/pdf') {
            result.errors.push(`Type MIME incorrect: ${file.type} (attendu: application/pdf)`);
          }
        }

        // Vérification 2 : Taille
        if (file.size < opts.minSize) {
          result.errors.push(`Fichier trop petit: ${file.size} bytes (min: ${opts.minSize})`);
        }
        if (file.size > opts.maxSize) {
          result.errors.push(`Fichier trop grand: ${file.size} bytes (max: ${opts.maxSize})`);
        }

        // Vérification 3 : Signature PDF et EOF marker
        const buffer = await blobToArrayBuffer(file);

        if (opts.checkSignature) {
          result.hasPDFSignature = hasPDFSignature(buffer);
          if (!result.hasPDFSignature) {
            result.errors.push('Signature PDF manquante ou invalide');
          }
        }

        if (opts.checkEOF) {
          result.hasEOFMarker = hasEOFMarker(buffer);
          if (!result.hasEOFMarker) {
            result.warnings.push('Marqueur EOF manquant (PDF peut être corrompu)');
          }
        }

        // Déterminer la validité globale
        result.isValid = result.errors.length === 0;

      } catch (error) {
        result.isValid = false;
        result.errors.push(`Erreur lors de la validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      } finally {
        setIsValidating(false);
        setValidationResult(result);
      }

      return result;
    },
    []
  );

  /**
   * Valide un fichier reçu d'un téléchargement (Blob ou File)
   */
  const validateDownloadedPDF = useCallback(
    async (blob: Blob, filename?: string): Promise<PDFValidationResult> => {
      const result = await validatePDF(blob);

      // Vérifications supplémentaires pour les fichiers téléchargés
      if (filename) {
        if (!filename.toLowerCase().endsWith('.pdf')) {
          result.warnings.push('Nom de fichier n\'a pas l\'extension .pdf');
        }
      }

      return result;
    },
    [validatePDF]
  );

  /**
   * Réinitialise le résultat de validation
   */
  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validationResult,
    isValidating,
    validatePDF,
    validateDownloadedPDF,
    clearValidation,
    hasPDFSignature,
    hasEOFMarker,
  };
};
