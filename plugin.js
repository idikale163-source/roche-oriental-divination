window.RochePlugin.register({
  id: "sully-oriental-divination",
  name: "玄灵阁",
  version: "1.0.0",
  apps: [
    {
      id: "sully-oriental-divination-app",
      name: "玄灵阁占卜",
      icon: "auto_awesome", 
      async mount(container, roche) {
        const styleId = "roche-plugin-divination-style";
        if (!document.getElementById(styleId)) {
          const style = document.createElement("style");
          style.id = styleId;
          style.textContent = `
            .roche-plugin-divination-wrap {
              font-family: "楷体", "KaiTi", serif;
              background-color: #F4EFE6;
              color: #2B2B2B;
              display: flex;
              flex-direction: column;
              height: 100%;
              width: 100%;
              overflow: hidden;
              box-sizing: border-box;
              --accent-color: #8C2218;
              --border-color: #D3C5B3;
            }
            .roche-plugin-divination-wrap * { box-sizing: border-box; }
            .divine-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 2px solid var(--border-color); flex-shrink: 0; }
            .divine-header h1 { margin: 0; color: var(--accent-color); font-size: 20px; letter-spacing: 2px; }
            .divine-close-btn { background: none; border: none; font-size: 16px; color: #666; cursor: pointer; }
            .divine-page { display: none; flex: 1; flex-direction: column; overflow: hidden; padding: 16px; }
            .divine-page.active { display: flex; }
            .divine-panel { background: rgba(255,255,255,0.5); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 16px; overflow-y: auto; }
            .divine-form-group { margin-bottom: 16px; }
            .divine-form-group label { display: block; font-weight: bold; margin-bottom: 8px; color: var(--accent-color); }
            .divine-form-group select { width: 100%; padding: 10px; font-size: 16px; border: 1px solid var(--border-color); border-radius: 4px; background: #FFF; }
            .divine-btn { width: 100%; background-color: var(--accent-color); color: #FFF; border: none; padding: 14px; font-size: 18px; border-radius: 4px; cursor: pointer; letter-spacing: 2px; flex-shrink: 0; }
            .divine-btn:active { transform: scale(0.98); }
            .divine-btn:disabled { background-color: #999; }
            .divine-chat-box { flex: 1; overflow-y: auto; background: #FFF9F2; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 10px; }
            .divine-bubble { max-width: 85%; padding: 10px 14px; border-radius: 8px; font-size: 15px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
            .divine-bubble.user { align-self: flex-end; background: #E8E2D5; color: #2B2B2B; border-bottom-right-radius: 0; }
            .divine-bubble.ai { align-self: flex-start; background: var(--accent-color); color: #FFF; border-bottom-left-radius: 0; }
            .divine-bubble.system { align-self: center; background: transparent; color: #888; font-size: 12px; text-align: center; }
            .divine-input-area { display: flex; gap: 8px; flex-shrink: 0; margin-bottom: 10px; }
            .divine-input-area input { flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 16px; }
            .divine-input-area button { width: 80px; font-size: 16px; padding: 0; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer; }
            .divine-modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.6); display: none; justify-content: center; align-items: center; z-index: 100; backdrop-filter: blur(2px); }
            .divine-modal { background: #FFF9F2; padding: 24px; border-radius: 12px; width: 85%; max-width: 400px; border: 2px solid var(--accent-color); }
            .divine-modal h3 { margin-top: 0; color: var(--accent-color); text-align: center; font-size: 20px; }
            .divine-modal p { color: #555; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 20px; }
            .divine-modal-actions { display: flex; flex-direction: column; gap: 10px; }
            .divine-btn-secondary { background: transparent; color: var(--accent-color); border: 1px solid var(--accent-color); }
          `;
          document.head.appendChild(style);
        }

        container.innerHTML = `
          <div class="roche-plugin-divination-wrap">
            <div class="divine-header">
              <h1>☯ 玄灵阁</h1>
              <button class="divine-close-btn" id="divine-close">关闭</button>
            </div>
            <div id="divine-page-setup" class="divine-page active">
              <div class="divine-panel">
                <div class="divine-form-group">
                  <label>1. 选择羁绊之人</label>
                  <select id="divine-char-select"><option value="">加载中...</option></select>
                </div>
                <div class="divine-form-group">
                  <label>2. 占卜所求</label>
                  <select id="divine-type">
                    <option value="射覆">🔮 射覆 (对方猜你身边的物品)</option>
                    <option value="运势">🌟 近期运势 (吉凶祸福)</option>
                    <option value="桃花">🌸 桃花姻缘 (情感羁绊)</option>
                    <option value="财运">💰 财运走势 (正财偏财)</option>
                  </select>
                </div>
              </div>
              <button class="divine-btn" id="divine-btn-start">入局开卦</button>
            </div>
            <div id="divine-page-chat" class="divine-page">
              <div class="divine-chat-box" id="divine-chat-box"></div>
              <div class="divine-input-area">
                <input type="text" id="divine-chat-input" placeholder="请在此输入...">
                <button id="divine-btn-send">发送</button>
              </div>
              <button class="divine-btn divine-btn-secondary" id="divine-btn-end" style="padding: 10px; font-size: 16px;">结卦退隐</button>
            </div>
            <div class="divine-modal-overlay" id="divine-end-modal">
              <div class="divine-modal">
                <h3>☯ 结卦退隐</h3>
                <p>推演已毕。是否将这段天机结论，刻入对方的主事实记忆中？<br><br><span style="color:#8C2218; font-size:12px;">注：写入后卸载插件也不会消失，需手动在Roche记忆中删除。</span></p>
                <div class="divine-modal-actions">
                  <button class="divine-btn" id="divine-btn-save">铭记天机 (写入主记忆)</button>
                  <button class="divine-btn divine-btn-secondary" id="divine-btn-leave">天机不可泄露 (默默离开)</button>
                </div>
              </div>
            </div>
          </div>
        `;

        const ui = {
          closeBtn: container.querySelector("#divine-close"),
          pageSetup: container.querySelector("#divine-page-setup"),
          pageChat: container.querySelector("#divine-page-chat"),
          charSelect: container.querySelector("#divine-char-select"),
          typeSelect: container.querySelector("#divine-type"),
          btnStart: container.querySelector("#divine-btn-start"),
          chatBox: container.querySelector("#divine-chat-box"),
          chatInput: container.querySelector("#divine-chat-input"),
          btnSend: container.querySelector("#divine-btn-send"),
          btnEnd: container.querySelector("#divine-btn-end"),
          endModal: container.querySelector("#divine-end-modal"),
          btnSave: container.querySelector("#divine-btn-save"),
          btnLeave: container.querySelector("#divine-btn-leave")
        };

        let sessionState = {
          messages: [],
          charId: "",
          charName: "",
          conversationId: "",
          userName: "",
          divineType: "",
          systemPrompt: ""
        };

        const LORE = `
【东方玄学设定】：
- 射覆：古代数术家占卜游戏，猜器皿下藏的物品。你要主动用八卦物象（如乾为金、坎为水、离为火、巽为木）向用户提问特征。
- 桃花：命理异性缘分，看五行互补与流年星象。
- 财运：分正财与偏财，水为财，土生金。
- 运势：流年运势，受宇宙磁场影响。修心为上。
`;

        const switchPage = (page) => {
          ui.pageSetup.classList.remove("active");
          ui.pageChat.classList.remove("active");
          page.classList.add("active");
        };

        const appendBubble = (role, text) => {
          const div = document.createElement("div");
          div.className = `divine-bubble ${role}`;
          div.textContent = text;
          ui.chatBox.appendChild(div);
          setTimeout(() => { ui.chatBox.scrollTop = ui.chatBox.scrollHeight; }, 50);
        };

        const cleanAndSplitAIText = (text) => {
          let clean = text.replace(/```[a-z]*\n?/gi, '').trim();
          let lines = clean.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          let result = [];
          for (let l of lines) {
            l = l.replace(/^\[.*?\]\s*.*?[：:]\s*/, '');
            l = l.replace(/^.*?[：:]\s*/, '');
            if (l) result.push(l);
          }
          return result;
        };

        ui.closeBtn.onclick = () => roche.ui.closeApp();

        try {
          const chars = await roche.character.list();
          ui.charSelect.innerHTML = chars.map(c => `<option value="${c.id}">${c.handle || c.name}</option>`).join('');
        } catch (err) {
          roche.ui.toast("获取角色列表失败");
        }

        ui.btnStart.onclick = async () => {
          sessionState.charId = ui.charSelect.value;
          sessionState.divineType = ui.typeSelect.value;
          if (!sessionState.charId) return roche.ui.toast("请先选择羁绊之人");
          ui.btnStart.disabled = true;
          ui.btnStart.textContent = "读取因果中...";
          try {
            const char = await roche.character.get(sessionState.charId);
            const activeUser = await roche.persona.getActiveUserPersona();
            sessionState.charName = char.handle || char.name;
            sessionState.conversationId = char.conversationId;
            sessionState.userName = activeUser?.handle || activeUser?.name || "信士";
            let userBio = activeUser?.persona || activeUser?.bio || "无特殊";
            let charBio = char.persona || char.bio || "无记录";
            let memoryContext = "";
            let shortTermCtx = "";
            if (sessionState.divineType !== "射覆" && sessionState.conversationId) {
              const longTerm = await roche.memory.getLongTerm({ conversationId: sessionState.conversationId, limit: 20 });
              const shortTerm = await roche.memory.getShortTerm({ conversationId: sessionState.conversationId, limit: 10 });
              memoryContext = longTerm.core?.summary || "";
              shortTermCtx = shortTerm.map(m => `${m.senderName}: ${m.text}`).join('\n');
            }
            if (sessionState.divineType === "射覆") {
              sessionState.systemPrompt = `【当前模式】：射覆（猜物游戏）\n【规则】：信士(${sessionState.userName})此时在现实中看着或藏着一个物品。你需要利用易经八卦理论向用户提问（如问颜色、形状），并逐步推理猜出物品。\n${LORE}\n【绝对禁止】：不要带任何前缀或人名！回复简短！\n请主动向用户打招呼，抛出第一个试探性问题。`;
            } else {
              sessionState.systemPrompt = `【当前模式】：${sessionState.divineType} 占卜\n【所测之人】：信士(${sessionState.userName}) 与 羁绊对象(${sessionState.charName})\n【信士命理】：${userBio}\n【羁绊设定】：${charBio}\n【核心因果】：${memoryContext}\n【近期动态】：\n${shortTermCtx}\n\n${LORE}\n【绝对禁止】：不要带任何前缀或人名！回复简短！每次只说一两句话。\n请根据上述因果，先打招呼并起卦给出初步断言，引导信士追问。`;
            }
            sessionState.messages = [];
            ui.chatBox.innerHTML = "";
            switchPage(ui.pageChat);
            appendBubble("system", `—— 卦阵已开，等待神明降临 ——`);
            await triggerAI();
          } catch (err) {
            roche.ui.toast("启动失败: " + err.message);
          } finally {
            ui.btnStart.disabled = false;
            ui.btnStart.textContent = "入局开卦";
          }
        };

        const triggerAI = async () => {
          ui.btnSend.disabled = true;
          ui.chatInput.disabled = true;
          try {
            const aiMessages = [{ role: "system", content: sessionState.systemPrompt }, ...sessionState.messages];
            const result = await roche.ai.chat({ messages: aiMessages, temperature: 0.8 });
            const cleanLines = cleanAndSplitAIText(result.text);
            if (cleanLines.length === 0) {
              appendBubble("system", "对方陷入了沉思...");
              return;
            }
            for (let i = 0; i < cleanLines.length; i++) {
              const line = cleanLines[i];
              sessionState.messages.push({ role: 'assistant', content: line });
              setTimeout(() => { appendBubble("ai", line); }, i * 300);
            }
          } catch (err) {
            appendBubble("system", "通讯受阻: " + err.message);
          } finally {
            setTimeout(() => { ui.btnSend.disabled = false; ui.chatInput.disabled = false; ui.chatInput.focus(); }, 500);
          }
        };

        const sendAction = async () => {
          const text = ui.chatInput.value.trim();
          if (!text) return;
          ui.chatInput.value = "";
          sessionState.messages.push({ role: 'user', content: text });
          appendBubble("user", text);
          await triggerAI();
        };
        ui.btnSend.onclick = sendAction;
        ui.chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendAction(); };

        ui.btnEnd.onclick = () => {
          if (sessionState.messages.length === 0) return roche.ui.closeApp();
          ui.endModal.style.display = "flex";
        };

        ui.btnLeave.onclick = () => roche.ui.closeApp();

        ui.btnSave.onclick = async () => {
          if (!sessionState.conversationId) {
            roche.ui.toast("该角色缺少会话ID，无法写入记忆");
            return roche.ui.closeApp();
          }
          ui.btnSave.disabled = true;
          ui.btnSave.textContent = "正在铭记...";
          const lastAIMsg = [...sessionState.messages].reverse().find(m => m.role === 'assistant')?.content || "推演结束。";
          const shortDesc = lastAIMsg.substring(0, 80) + (lastAIMsg.length > 80 ? "..." : "");
          try {
            await roche.memory.write({
              conversationId: sessionState.conversationId,
              summaryText: `[玄灵阁占卜] ${sessionState.userName}与${sessionState.charName}进行了一次${sessionState.divineType}推演。大师卦象结论：${shortDesc}`,
              who: [sessionState.userName, sessionState.charName],
              action: `在玄灵阁进行了${sessionState.divineType}推演`,
              when: "刚刚",
              where: "玄灵阁",
              source: "plugin"
            });
            roche.ui.toast("天机已封入因果(主记忆)！");
            setTimeout(() => { roche.ui.closeApp(); }, 800);
          } catch (err) {
            roche.ui.toast("写入记忆失败: " + err.message);
            ui.btnSave.disabled = false;
            ui.btnSave.textContent = "铭记天机 (写入主记忆)";
          }
        };
      },
      async unmount(container, roche) {
        container.replaceChildren();
        const style = document.getElementById("roche-plugin-divination-style");
        if (style) style.remove();
      }
    }
  ]
});