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
  function refresh(){text();gain();}

  document.addEventListener("DOMContentLoaded",()=>{
    refresh();
    $("betStake")?.addEventListener("input",gain);
    $("betMarket")?.addEventListener("change",()=>setTimeout(gain,0));
    $("betEventId")?.addEventListener("change",()=>setTimeout(gain,0));
    $("language")?.addEventListener("change",()=>setTimeout(refresh,0));
    $("currency")?.addEventListener("change",()=>setTimeout(gain,0));
    const oddsBox=$("selectedOdds");if(oddsBox)new MutationObserver(gain).observe(oddsBox,{childList:true,characterData:true,subtree:true});
  });
})();