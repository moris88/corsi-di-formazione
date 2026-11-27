// Punto d'ingresso della pagina di allenamento: la logica è nei moduli di ./allenamento/
import { loadAllBanks } from "./allenamento/banks.js";
import { bindEvents, bindLinkGuard } from "./allenamento/events.js";
import { renderSetup } from "./allenamento/setup.js";

bindEvents();

renderSetup();
loadAllBanks().then(renderSetup);

bindLinkGuard();
