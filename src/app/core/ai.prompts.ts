export const BASE_PROMPT_ES = `Analiza cuidadosamente el rostro de la persona en la imagen proporcionada.
Mantén todas las facciones originales del rostro (ojos, piel, nariz, barba, fondo y expresión).
Tu única tarea es modificar el cabello para mostrar cómo se vería el usuario con un corte de cabello moderno, realista y favorecedor.

No alteres el estilo de iluminación ni el fondo.
No generes un dibujo, pintura ni caricatura: debe parecer una fotografía real del mismo usuario después de visitar una barbería profesional.

Elige el estilo que mejor se adapte a la forma del rostro del usuario.
Asegúrate de mantener la simetría natural del rostro y la textura realista del cabello.
El resultado debe ser una imagen profesional, nítida y visualmente atractiva, adecuada para mostrar en una página web de barbería.`;

export const NEGATIVE_PROMPT_ES = `No cambiar ni deformar ojos, piel, nariz, boca, barba, orejas ni proporciones faciales.
No modificar el fondo ni la iluminación original.
No convertir a dibujo, pintura, caricatura, cómic, anime o ilustración.
Evitar efectos artificiales (HDR exagerado, filtros pesados, piel plástica, blur excesivo).
Sin artefactos, ghosting, doble cara, manos u objetos superpuestos en el rostro.
No recortar el rostro; mantener encuadre y perspectiva originales.`;

export const STYLE_PROMPTS_ES: Record<string, string> = {
  'Fade bajo': 'Aplicar un fade bajo limpio y gradual, conservando líneas naturales y un acabado profesional.',
  'Mid fade': 'Aplicar un fade medio bien balanceado, con transición suave y contornos nítidos.',
  'Degradado alto': 'Aplicar un degradado alto marcado, manteniendo texturas realistas y laterales definidos.',
  'Pompadour clásico': 'Aplicar un pompadour clásico con volumen controlado y peinado pulido hacia atrás.',
  'Undercut texturizado': 'Aplicar un undercut con textura moderna en la parte superior y laterales contrastados.',
  'Buzz cut limpio': 'Aplicar un buzz cut uniforme, prolijo y favorecedor según la forma del rostro.'
};