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
  function addWalletLayout(){
    const panel=$("paymentPanel");if(!panel||panel.dataset.layoutReady)return;panel.dataset.layoutReady="1";
    const extra=document.createElement("div");extra.id="requestExtraFields";extra.innerHTML=`
      <div class="field"><label>Deviz</label><select><option>HTG</option><option>USD</option><option>EUR</option><option>CAD</option><option>DOP</option></select></div>
      <div class="field"><label>Referans</label><input type="text" autocomplete="off"></div>
      <div class="field"><label>Foto / dokiman</label><input type="file" accept="image/*"></div>`;
    const btn=$("paymentBtn");if(btn)panel.insertBefore(extra,btn);
  }
  function addAdminLayout(){
    const page=$("page-admin");if(!page||$("requestAdminUi"))return;
    const box=document.createElement("div");box.id="requestAdminUi";box.className="panel";box.innerHTML=`
      <div class="page-title"><h2>Validasyon operasyon</h2><p>Revize demann ki soumèt nan aplikasyon an.</p></div>
      <div class="field"><label>Filtre</label><select><option>Tout</option><option>Depo</option><option>Retrè</option></select></div>
      <div class="empty">Pa gen demann an atant.</div>
      <hr style="margin:24px 0;border:0;border-top:1px solid #e5e7eb">
      <h3>Depo / Retrè admin</h3>
      <div class="field"><label>Itilizatè</label><input type="text" placeholder="Email / UID"></div>
      <div class="field"><label>Kalite</label><select><option>Depo</option><option>Retrè</option></select></div>
      <div class="field"><label>Montan</label><input type="number" min="1"></div>
      <div class="field"><label>Deviz</label><select><option>HTG</option><option>USD</option><option>EUR</option><option>CAD</option><option>DOP</option></select></div>
      <div class="field"><label>Referans</label><input type="text"></div>`;
    page.appendChild(box);
  }
  function refresh(){text();gain();addWalletLayout();addAdminLayout();}
  document.addEventListener("DOMContentLoaded",()=>{refresh();$("betStake")?.addEventListener("input",gain);$("betMarket")?.addEventListener("change",()=>setTimeout(gain,0));$("betEventId")?.addEventListener("change",()=>setTimeout(gain,0));$("language")?.addEventListener("change",()=>setTimeout(refresh,0));$("currency")?.addEventListener("change",()=>setTimeout(gain,0));const oddsBox=$("selectedOdds");if(oddsBox)new MutationObserver(gain).observe(oddsBox,{childList:true,characterData:true,subtree:true});});
})();