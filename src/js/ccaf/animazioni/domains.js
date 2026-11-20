// Catalogo delle animazioni: una voce per le basi e una per ogni dominio d'esame.
// L'ordine dell'array è quello delle schede; ogni scena sta in un file di scene/.
import { basiMemoria } from "./scene/basi-memoria.js";
import { basiParole } from "./scene/basi-parole.js";
import { d1Hook } from "./scene/d1-hook.js";
import { d1Loop } from "./scene/d1-loop.js";
import { d1Subagenti } from "./scene/d1-subagenti.js";
import { d2Annuncio } from "./scene/d2-annuncio.js";
import { d2Errori } from "./scene/d2-errori.js";
import { d2Mcp } from "./scene/d2-mcp.js";
import { d3Cicd } from "./scene/d3-cicd.js";
import { d3ClaudeMd } from "./scene/d3-claude-md.js";
import { d3Plan } from "./scene/d3-plan.js";
import { d3Terminale } from "./scene/d3-terminale.js";
import { d4Esempi } from "./scene/d4-esempi.js";
import { d4Modulo } from "./scene/d4-modulo.js";
import { d5Escalation } from "./scene/d5-escalation.js";
import { d5Scrivania } from "./scene/d5-scrivania.js";

export const domains = [
  {
    id: "basi",
    index: "00",
    short: "Le basi",
    title: "Come ragiona Claude",
    weight: "Prima di iniziare",
    text: "Due idee da avere chiare prima dei domini: Claude scrive un pezzo alla volta leggendo solo il testo che ha davanti, e tra un messaggio e l'altro non ricorda nulla.",
    doc: "prerequisiti",
    scenes: [basiParole, basiMemoria],
  },
  {
    id: "d1",
    index: "D1",
    short: "Agenti",
    title: "Architettura agentica e orchestrazione",
    weight: "27% dell'esame",
    text: "Un agente è Claude messo in un ciclo, con degli strumenti a disposizione. Claude decide, il programma esegue: e il programma può anche rifiutarsi.",
    doc: "appunti-domain-1",
    scenes: [d1Loop, d1Subagenti, d1Hook],
  },
  {
    id: "d2",
    index: "D2",
    short: "Strumenti e MCP",
    title: "Design dei tool e integrazione MCP",
    weight: "18% dell'esame",
    text: "Claude sceglie uno strumento leggendone nome e descrizione, come un annuncio di lavoro. MCP è la presa standard per collegare Claude ai sistemi esterni.",
    doc: "appunti-domain-2",
    scenes: [d2Annuncio, d2Errori, d2Mcp],
  },
  {
    id: "d3",
    index: "D3",
    short: "Claude Code",
    title: "Configurazione e workflow di Claude Code",
    weight: "20% dell'esame",
    text: "Claude Code è Claude che lavora dentro un progetto software: dal terminale, dall'editor o da solo dentro una pipeline. Si guida con file di istruzioni, modalità di permesso e automatismi che scattano sempre.",
    doc: "appunti-domain-3",
    scenes: [d3Terminale, d3ClaudeMd, d3Plan, d3Cicd],
  },
  {
    id: "d4",
    index: "D4",
    short: "Prompt e output",
    title: "Prompt engineering e output strutturato",
    weight: "20% dell'esame",
    text: "Come chiedere le cose a Claude perché il risultato sia prevedibile: esempi ben scelti, moduli da compilare e un controllo del codice sui dati.",
    doc: "appunti-domain-4",
    scenes: [d4Esempi, d4Modulo],
  },
  {
    id: "d5",
    index: "D5",
    short: "Contesto",
    title: "Contesto e affidabilità",
    weight: "15% dell'esame",
    text: "Il contesto è la scrivania di Claude: ha un limite e i riassunti perdono i dettagli. Un agente affidabile sa anche quando passare la mano a una persona.",
    doc: "appunti-domain-5",
    scenes: [d5Scrivania, d5Escalation],
  },
];
