let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = null;
let agents = {};
let currentAgent = null;

function login(){
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  if(users[username] && users[username].password === password){
    currentUser = username;
    agents = users[username].agents || {};
    document.getElementById("loginScreen").style.display="none";
    document.getElementById("app").style.display="block";
    renderAgents();
    updateStats();
    drawChart();
  } else alert("اسم المستخدم أو كلمة المرور خطأ");
}

function register(){
  let username = document.getElementById("newUser").value;
  let password = document.getElementById("newPass").value;
  if(!username || !password) return alert("الرجاء إدخال اسم المستخدم وكلمة المرور");
  if(users[username]) return alert("اسم المستخدم موجود مسبقًا");
  users[username] = {password: password, agents:{}};
  localStorage.setItem("users", JSON.stringify(users));
  alert("تم إنشاء الحساب بنجاح!");
}

function saveData(){
  if(!currentUser) return;
  users[currentUser].agents = agents;
  localStorage.setItem("users", JSON.stringify(users));
}

function addAgent(){
  let name = document.getElementById("agentName").value;
  if(!name) return;
  agents[name] = {received:0, remaining:0, records:[]};
  saveData();
  renderAgents();
  updateStats();
  drawChart();
}

function renderAgents(){
  let list = document.getElementById("agentsList");
  list.innerHTML="";
  for(let name in agents){
    let li=document.createElement("li");
    li.innerText=name;
    li.onclick=()=>showAgentDetails(name);
    list.appendChild(li);
  }
}

function showPage(pageId){
  let pages = document.querySelectorAll(".page");
  pages.forEach(p=>p.style.display="none");
  document.getElementById(pageId).style.display="block";
}

function showAgentDetails(name){
  currentAgent = name;
  document.getElementById("agentDetails").style.display="block";
  document.getElementById("currentAgentName").innerText = name;
  updateAgentStats();
}

function closeAgentDetails(){
  document.getElementById("agentDetails").style.display="none";
  currentAgent = null;
}

function updateAgentStats(){
  if(!currentAgent) return;
  document.getElementById("agent_received").innerText = agents[currentAgent].received;
  document.getElementById("agent_remaining").innerText = agents[currentAgent].remaining;
}

function addOperation(){
  if(!currentAgent) return alert("اختر مندوبًا أولًا");
  let amount = parseFloat(document.getElementById("op_amount").value) || 0;
  let remaining = parseFloat(document.getElementById("op_remaining").value) || 0;
  if(amount <= 0 && remaining <=0) return alert("أدخل المبلغ أو الباقي");
  agents[currentAgent].received += amount;
  agents[currentAgent].remaining += remaining;
  agents[currentAgent].records.push({received:amount, remaining:remaining, date:new Date().toLocaleDateString()});
  saveData();
  updateAgentStats();
  updateStats();
  drawChart();
  document.getElementById("op_amount").value="";
  document.getElementById("op_remaining").value="";
}

function updateStats(){
  let daily=0, monthly=0, yearly=0;
  let today = new Date().toLocaleDateString();
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  for(let name in agents){
    agents[name].records.forEach(r=>{
      let d=new Date(r.date);
      if(r.date==today) daily+=r.received;
      if(d.getMonth()==currentMonth && d.getFullYear()==currentYear) monthly+=r.received;
      if(d.getFullYear()==currentYear) yearly+=r.received;
    });
  }
  document.getElementById("dailyTotal").innerText=daily;
  document.getElementById("monthlyTotal").innerText=monthly;
  document.getElementById("yearlyTotal").innerText=yearly;
}

function drawChart(){
  let received=0, remaining=0;
  for(let name in agents){received+=agents[name].received; remaining+=agents[name].remaining;}
  let ctx=document.getElementById("statsChart");
  new Chart(ctx,{type:'bar',data:{labels:['الواصل','الباقي'],datasets:[{label:'الإحصائيات',data:[received,remaining],backgroundColor:['#28a745','#dc3545']}]}} );
}

function darkMode(){document.body.classList.toggle("dark");}