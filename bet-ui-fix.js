(()=>{
  const $=id=>document.getElementById(id);
  const labels={
    ht:{rule:"Peman gagnan yo kalkile lè evènman an regle.",gain:"Gain potentiel estimé",note:"Estimasyon selon cote ki afiche a; montan final la konfime lè tikè a regle."},
    fr:{rule:"Le paiement du gagnant est calculé lors du règlement de l'événement.",gain:"Gain potentiel estimé",note:"Estimation selon la cote affichée; le montant final est confirmé au règlement du ticket."},
    en:{rule:"Winner payment is calculated when the event is settled.",gain:"Estimated potential return",note:"Estimate based on the displayed odds; the final amount is confirmed when the ticket is settled."},
    es:{rule:"El pago del ganador se calcula al liquidar el evento.",gain:"Ganancia potencial estimada",note:"Estimación según la cuota mostrada; el importe final se confirma al liquidar el boleto."}
  };
  function language(){return $("language")?.value||"ht";}
  function text(){const t=labels[language()]||labels.ht;if($("ticketRuleText"))$("ticketRuleText").textContent=t.rule;if($("potentialGainLabel"))$("potentialGainLabel").textContent=t.gain;if($("potentialGainNote"))$("potentialGainNote").textContent=t.note;}
  function odds(){const s=$("selectedOdds")?.textContent||"";const m=s.match(/([0-9]+(?:[.,][0-9]+)?)/);return m?Number(m[1].replace(",",".")):0;}
  function gain(){const stake=Number($("betStake")?.value||0),o=odds(),c=$("ticketCurrency")?.textContent||"HTG",v=stake>0&&o>0?stake*o:0;if($("potentialGain"))$("potentialGain").textContent=`${v.toLocaleString(undefined,{maximumFractionDigits:2})} ${c}`;}

  function injectUiStyles(){
    if($("manualUiStyles"))return;
    const s=document.createElement("style");
    s.id="manualUiStyles";
    s.textContent=`
      #providerCard{margin:18px 0;padding:24px;border:1px solid #dfe5ec;border-radius:26px;background:linear-gradient(180deg,#fff 0%,#f8fbff 100%);box-shadow:0 8px 26px rgba(15,23,42,.04)}
      #providerCard .pc-head{display:flex;gap:18px;align-items:center}
      #providerCard .pc-logo{min-width:145px;height:74px;border-radius:18px;border:1px solid #e1e7ee;background:#fff;display:flex;align-items:center;justify-content:center;padding:0 14px;box-sizing:border-box}
      #providerCard .pc-logo.nat{color:#169f64;font-weight:900;font-size:18px;letter-spacing:-.2px}
      #providerCard .pc-logo.nat:before{content:'◀';display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin-right:7px;border-radius:50%;background:#20b66e;color:#fff;font-size:14px}
      #providerCard .pc-logo.mon{color:#c5162e;font-weight:900;font-size:18px}
      #providerCard .pc-title strong{display:block;font-size:22px;color:#101827;line-height:1.2}
      #providerCard .pc-title span{display:block;color:#697586;font-size:16px;margin-top:6px}
      #providerCard .pc-rule{height:1px;background:#e5e7eb;margin:22px 0}
      #providerCard .pc-copy{margin:0;color:#667085;font-size:17px;line-height:1.55}
      #providerCard .pc-status{margin-top:20px;padding:14px 16px;border-radius:14px;background:#dcfce7;color:#166534;font-weight:800;font-size:15px}
      #paymentPanel .field label{font-weight:800;color:#172033}
      #requestExtraFields .field{margin-top:16px}
      #requestExtraFields input,#requestExtraFields select{min-height:58px}
      #paymentBtn{min-height:58px;border-radius:16px;font-size:18px;font-weight:900}
      @media(max-width:480px){#providerCard{padding:20px}#providerCard .pc-logo{min-width:128px;height:66px}#providerCard .pc-title strong{font-size:20px}#providerCard .pc-copy{font-size:16px}}
    `;
    document.head.appendChild(s);
  }

  function card(method){
    const nat=method==="natcash";
    const n=nat?"NatCash":"MonCash";
    const logo=nat?'<div class="pc-logo nat">NatCash</div>':'<div class="pc-logo mon">MonCash</div>';
    return `<div id="providerCard"><div class="pc-head">${logo}<div class="pc-title"><strong>${n}</strong><span>Sèvis manyèl</span></div></div><div class="pc-rule"></div><p class="pc-copy">Ranpli enfòmasyon yo epi ajoute referans ak foto/dokiman pou administrasyon an revize demann lan.</p><div class="pc-status">Sèvis ${n} la disponib pou revizyon demann.</div></div>`;
  }

  function syncCard(){
    const old=$("providerCard");if(!old)return;
    const active=document.querySelector(".payment-method.active");
    const wrap=document.createElement("div");
    wrap.innerHTML=card(active?.dataset.paymentMethod||"moncash");
    old.replaceWith(wrap.firstElementChild);
  }

  function addWalletLayout(){
    const panel=$("paymentPanel");if(!panel||panel.dataset.layoutReady)return;
    panel.dataset.layoutReady="1";
    injectUiStyles();
    const methods=panel.querySelector(".payment-methods");
    if(methods){const h=document.createElement("div");h.innerHTML=card("moncash");methods.insertAdjacentElement("afterend",h.firstElementChild);}
    const extra=document.createElement("div");
    extra.id="requestExtraFields";
    extra.innerHTML=`
      <div class="field"><label>Deviz</label><select><option>HTG</option><option>USD</option><option>EUR</option><option>CAD</option><option>DOP</option></select></div>
      <div class="field"><label>Referans</label><input type="text" autocomplete="off"></div>
      <div class="field"><label>Foto / dokiman</label><input type="file" accept="image/*"></div>`;
    const btn=$("paymentBtn");
    if(btn){panel.insertBefore(extra,btn);btn.textContent="Soumèt";}
    panel.querySelectorAll(".payment-method").forEach(b=>b.addEventListener("click",()=>setTimeout(syncCard,0)));
  }

  function addAdminLayout(){
    const page=$("page-admin");if(!page||$("requestAdminUi"))return;
    const box=document.createElement("div");box.id="requestAdminUi";box.className="panel";
    box.innerHTML=`<div class="page-title"><h2>Validasyon operasyon</h2><p>Revize demann ki soumèt nan aplikasyon an.</p></div><div class="field"><label>Filtre</label><select><option>Tout</option><option>Depo</option><option>Retrè</option></select></div><div class="empty">Pa gen demann an atant.</div><hr style="margin:24px 0;border:0;border-top:1px solid #e5e7eb"><h3>Depo / Retrè admin</h3><div class="field"><label>Itilizatè</label><input type="text" placeholder="Email / UID"></div><div class="field"><label>Kalite</label><select><option>Depo</option><option>Retrè</option></select></div><div class="field"><label>Montan</label><input type="number" min="1"></div><div class="field"><label>Deviz</label><select><option>HTG</option><option>USD</option><option>EUR</option><option>CAD</option><option>DOP</option></select></div><div class="field"><label>Metòd</label><select><option>NatCash</option><option>MonCash</option></select></div><div class="field"><label>Referans</label><input type="text"></div>`;
    page.appendChild(box);
  }

  function refresh(){text();gain();addWalletLayout();addAdminLayout();}
  document.addEventListener("DOMContentLoaded",()=>{refresh();$("betStake")?.addEventListener("input",gain);$("betMarket")?.addEventListener("change",()=>setTimeout(gain,0));$("betEventId")?.addEventListener("change",()=>setTimeout(gain,0));$("language")?.addEventListener("change",()=>setTimeout(refresh,0));$("currency")?.addEventListener("change",()=>setTimeout(gain,0));const oddsBox=$("selectedOdds");if(oddsBox)new MutationObserver(gain).observe(oddsBox,{childList:true,characterData:true,subtree:true});});
})();