(()=>{
  const $=id=>document.getElementById(id);
  const labels={
    ht:{rule:"Peman gagnan yo kalkile lè evènman an regle.",gain:"Gain potentiel estimé",note:"Estimasyon selon cote ki afiche a; montan final la konfime lè tikè a regle."},
    fr:{rule:"Le paiement du gagnant est calculé lors du règlement de l'événement.",gain:"Gain potentiel estimé",note:"Estimation selon la cote affichée; le montant final est confirmé au règlement du ticket."},
    en:{rule:"Winner payment is calculated when the event is settled.",gain:"Estimated potential return",note:"Estimate based on the displayed odds; the final amount is confirmed when the ticket is settled."},
    es:{rule:"El pago del ganador se calcula al liquidar el evento.",gain:"Ganancia potencial estimada",note:"Estimación según la cuota mostrada; el importe final se confirma al liquidar el boleto."}
  };

  let cachedToken="";
  let cachedUid="";

  async function token(force=false){
    if(!state.user)return "";
    const uid=state.user.uid||"";
    if(!force&&cachedToken&&cachedUid===uid)return cachedToken;
    cachedToken=await state.user.getIdToken(force);
    cachedUid=uid;
    return cachedToken;
  }

  async function request(path,opt={},retry=true){
    const headers={"Content-Type":"application/json",...(opt.headers||{})};
    const idToken=await token(false);
    if(idToken)headers.Authorization=`Bearer ${idToken}`;
    if(state.adminSession&&path.startsWith("/api/admin/"))headers["X-Admin-Session"]=state.adminSession;
    let r=await fetch(API+path,{...opt,headers,cache:"no-store"});
    if(r.status===401&&state.user&&retry){
      const fresh=await token(true);
      if(fresh)headers.Authorization=`Bearer ${fresh}`;
      r=await fetch(API+path,{...opt,headers,cache:"no-store"});
    }
    const d=await r.json().catch(()=>({}));
    if(!r.ok){const e=new Error(d.error||`Server error (${r.status})`);e.status=r.status;e.data=d;throw e;}
    return d;
  }

  try{api=request;}catch(_){window.api=request;}

  function language(){return $("language")?.value||"ht";}
  function text(){const t=labels[language()]||labels.ht;if($("ticketRuleText"))$("ticketRuleText").textContent=t.rule;if($("potentialGainLabel"))$("potentialGainLabel").textContent=t.gain;if($("potentialGainNote"))$("potentialGainNote").textContent=t.note;}
  function odds(){const s=$("selectedOdds")?.textContent||"";const m=s.match(/([0-9]+(?:[.,][0-9]+)?)/);return m?Number(m[1].replace(",",".")):0;}
  function gain(){const stake=Number($("betStake")?.value||0),o=odds(),c=$("ticketCurrency")?.textContent||"HTG",v=stake>0&&o>0?stake*o:0;if($("potentialGain"))$("potentialGain").textContent=`${v.toLocaleString(undefined,{maximumFractionDigits:2})} ${c}`;}
  function refresh(){text();gain();}

  function installTestNotice(){
    const panel=$("paymentPanel");
    if(!panel||$("paymentTestNotice"))return;
    const notice=document.createElement("div");
    notice.id="paymentTestNotice";
    notice.style.cssText="margin:12px 0;padding:12px;border:1px solid #d97706;border-radius:12px;background:#fff7ed;color:#7c2d12";
    notice.innerHTML="<strong>MODE TÈS</strong><div style='font-size:13px;margin-top:4px'>Depo ak retrè sou paj sa a pa dwe itilize pou voye oswa resevwa lajan reyèl.</div>";
    panel.insertBefore(notice,panel.firstChild);
    const btn=$("paymentBtn");
    if(btn){
      btn.textContent="Teste fòm nan";
      btn.addEventListener("click",e=>{
        e.preventDefault();
        e.stopImmediatePropagation();
        const msg=$("walletMsg");
        if(msg)msg.textContent="Mòd tès sèlman: okenn lajan reyèl pa transfere.";
      },true);
    }
  }

  document.addEventListener("DOMContentLoaded",()=>{
    refresh();
    installTestNotice();
    $("betStake")?.addEventListener("input",gain);
    $("betMarket")?.addEventListener("change",()=>setTimeout(gain,0));
    $("betEventId")?.addEventListener("change",()=>setTimeout(gain,0));
    $("language")?.addEventListener("change",()=>setTimeout(refresh,0));
    $("currency")?.addEventListener("change",()=>setTimeout(gain,0));
    const oddsBox=$("selectedOdds");if(oddsBox)new MutationObserver(gain).observe(oddsBox,{childList:true,characterData:true,subtree:true});
  });
})();