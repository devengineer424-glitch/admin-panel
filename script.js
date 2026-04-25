// Constants are defined in constants.js — load that file first.

let current="blogs"
let editId=null
let currentItems=[]

function setStatus(nodeId, message, isError=false){
const node=document.getElementById(nodeId)
if(!node) return
node.className=isError?"status error":"status success"
node.textContent=message
}

function resetAuthForm(){
document.getElementById("loginEmail").value=""
document.getElementById("loginPassword").value=""
document.getElementById("loginStatus").textContent=""
}

function getToken(){
return localStorage.getItem(TOKEN_KEY)
}

function showLogin(){
document.getElementById("loginScreen").classList.remove("hidden")
document.getElementById("appShell").classList.add("hidden")
}

function showAdmin(){
document.getElementById("loginScreen").classList.add("hidden")
document.getElementById("appShell").classList.remove("hidden")
}

function logout(message){
localStorage.removeItem(TOKEN_KEY)
showLogin()
if(message){
setStatus("loginStatus", message, true)
}
}

function decodePayload(token){
try{
const payloadPart=token.split(".")[1]
if(!payloadPart) return null
const normalized=payloadPart.replace(/-/g, "+").replace(/_/g, "/")
const json=decodeURIComponent(atob(normalized).split("").map((c)=>"%"+("00"+c.charCodeAt(0).toString(16)).slice(-2)).join(""))
return JSON.parse(json)
}catch(_e){
return null
}
}

function isExpired(token){
const payload=decodePayload(token)
if(!payload || !payload.exp) return true
return (Date.now()/1000)>=Number(payload.exp)
}

async function authFetch(url, options={}){
const token=getToken()

if(!token || isExpired(token)){
logout("Session expired. Please log in again.")
throw new Error("Missing or expired token")
}

const headers={...(options.headers || {}), Authorization:`Bearer ${token}`}

const response=await fetch(url,{...options,headers})

if(response.status===401 || response.status===403){
logout("Unauthorized access. Please log in again.")
throw new Error("Unauthorized")
}

return response
}

async function handleLogin(event){
event.preventDefault()

const supabaseUrl=SUPABASE_URL_DEFAULT
const anonKey=SUPABASE_ANON_KEY_DEFAULT
const email=document.getElementById("loginEmail").value.trim()
const password=document.getElementById("loginPassword").value

if(!supabaseUrl || !anonKey || !email || !password){
setStatus("loginStatus", "All fields are required", true)
return
}

try{
const response=await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
method:"POST",
headers:{
"Content-Type":"application/json",
"apikey":anonKey,
"Authorization":`Bearer ${anonKey}`
},
body:JSON.stringify({email,password})
})

const data=await response.json().catch(()=>({}))

const token = data.access_token || data.session?.access_token

if(!response.ok || !token){
  throw new Error(data.error_description || data.msg || "Login failed")
}

localStorage.setItem(TOKEN_KEY, token)

showAdmin()
loadBlogs()
}catch(err){
setStatus("loginStatus", err.message || "Login failed", true)
}
}

function isReadOnlySection(){
return current==="newsletter-subscribers" || current==="contact-messages"
}

function setAddVisibility(){
document.getElementById("addBtn").style.display=isReadOnlySection()?"none":"inline-block"
}

function getSubscriberEmails(){
return Array.from(new Set(
currentItems
.map(item=>String(item?.email || item?.gmail || item?.mail || "").trim())
.filter(Boolean)
))
}

function setSubscriberActionsVisibility(){
const copyBtn=document.getElementById("copyEmailsBtn")
if(!copyBtn) return

const isSubscribers=current==="newsletter-subscribers"

if(!isSubscribers){
copyBtn.style.display="none"
copyBtn.disabled=true
copyBtn.textContent="Copy All Emails"
return
}

const emails=getSubscriberEmails()

copyBtn.style.display="inline-block"
copyBtn.disabled=emails.length===0
copyBtn.textContent=emails.length ? `Copy All Emails (${emails.length})` : "Copy All Emails"
}

async function copyAllSubscriberEmails(){
const emails=getSubscriberEmails()

if(!emails.length){
alert("No subscriber emails available to copy.")
return
}

const payload=emails.join(", ")

try{
if(navigator.clipboard && window.isSecureContext){
await navigator.clipboard.writeText(payload)
}else{
const temp=document.createElement("textarea")
temp.value=payload
temp.setAttribute("readonly", "")
temp.style.position="absolute"
temp.style.left="-9999px"
document.body.appendChild(temp)
temp.select()
document.execCommand("copy")
document.body.removeChild(temp)
}

const copyBtn=document.getElementById("copyEmailsBtn")
if(copyBtn){
copyBtn.textContent="Copied"
setTimeout(()=>setSubscriberActionsVisibility(), 1200)
}
}catch(_error){
alert("Could not copy emails. Please try again.")
}
}

function setActive(nav){
document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"))
nav.classList.add("active")
}

function loadBlogs(){

current="blogs"
setActive(document.getElementById("blogNav"))
document.getElementById("sectionTitle").innerText="Blogs"
setAddVisibility()
setSubscriberActionsVisibility()
setMessagesView(true)

authFetch(API+"/blogs/")
.then(r=>r.json())
.then(renderBlogsView)

.catch((err)=>{
setStatus("loginStatus", err.message || "Request failed", true)
})

}

function loadCases(){

current="case-studies"
setActive(document.getElementById("caseNav"))
document.getElementById("sectionTitle").innerText="Case Studies"
setAddVisibility()
setSubscriberActionsVisibility()
setMessagesView(false)

authFetch(API+"/case-studies/")
.then(r=>r.json())
.then(renderTable)

.catch((err)=>{
setStatus("loginStatus", err.message || "Request failed", true)
})

}

function loadSubscribers(){

current="newsletter-subscribers"
currentItems=[]
setActive(document.getElementById("subsNav"))
document.getElementById("sectionTitle").innerText="Subscribed Emails"
setAddVisibility()
setSubscriberActionsVisibility()
setMessagesView(false)

authFetch(API+"/newsletter/subscribers")
.then(r=>r.json())
.then(renderTable)

.catch((err)=>{
setStatus("loginStatus", err.message || "Request failed", true)
})

}

function loadMessages(){

current="contact-messages"
setActive(document.getElementById("msgNav"))
document.getElementById("sectionTitle").innerText="Contact Messages"
setAddVisibility()
setSubscriberActionsVisibility()
setMessagesView(true)

authFetch(API+"/contact-messages/")
.then(r=>r.json())
.then(renderMessagesView)

.catch((err)=>{
setStatus("loginStatus", err.message || "Request failed", true)
})

}

function formatCellValue(value){
if(value===null || value===undefined) return ""
if(typeof value==="object") return JSON.stringify(value)
return String(value)
}

function setMessagesView(show){
const table=document.querySelector("table")
const messagesView=document.getElementById("messagesView")

if(show){
table.style.display="none"
messagesView.style.display="block"
}else{
messagesView.style.display="none"
table.style.display="table"
}
}

function renderMessagesView(data){
currentItems=Array.isArray(data)?data:[]

const container=document.getElementById("messagesView")
container.innerHTML=""

if(currentItems.length===0){
container.innerHTML='<div class="empty-state">No messages yet.</div>'
return
}

const grid=document.createElement("div")
grid.className="messages-grid"

currentItems.forEach((msg)=>{
const card=document.createElement("div")
card.className="message-card"

const createdAt=msg.created_at?new Date(msg.created_at).toLocaleString():""

card.innerHTML=`
<div class="message-top">
	<div>
		<div class="message-name">${escapeHtml(msg.name || "Unknown")}</div>
		<div class="message-email">${escapeHtml(msg.email || "")}</div>
	</div>
	<div class="message-date">${escapeHtml(createdAt)}</div>
</div>
<div class="message-subject">${escapeHtml(msg.subject || "No Subject")}</div>
<div class="message-body">${escapeHtml(msg.message || "")}</div>
`

grid.appendChild(card)
})

container.appendChild(grid)
}

function getBlogExcerpt(content){
const plain=String(content || "")
.replace(/```[\s\S]*?```/g, " ")
.replace(/`([^`]+)`/g, "$1")
.replace(/\[(.*?)\]\((.*?)\)/g, "$1")
.replace(/[#>*_\-]/g, " ")
.replace(/\s+/g, " ")
.trim()

if(!plain) return "No preview text available."
if(plain.length<=190) return plain
return `${plain.slice(0, 190)}...`
}

function formatBlogDate(blog){
const candidateDates=[
blog?.meta?.date,
blog?.meta_date,
blog?.date,
blog?.published_at,
blog?.updated_at,
blog?.created_at
]

for(const value of candidateDates){
if(!value) continue
const parsed=new Date(value)
if(!Number.isNaN(parsed.getTime())){
return parsed.toLocaleDateString()
}
}

return "No date"
}

function getStringHue(value){
const text=String(value || "untagged")
let hash=0

for(let i=0;i<text.length;i++){
hash=(hash<<5)-hash+text.charCodeAt(i)
hash|=0
}

return Math.abs(hash)%360
}

function getTagStyle(tag){
const hue=getStringHue(tag)
const bg=`hsla(${hue}, 80%, 90%, 0.92)`
const text=`hsl(${hue}, 64%, 28%)`
const border=`hsla(${hue}, 62%, 45%, 0.35)`
return `background:${bg};color:${text};border-color:${border};`
}

function buildBlogShareUrl(slug){
const base=String(FRONTEND_URL || "").replace(/\/+$/, "")
const cleanSlug=String(slug || "").trim()
if(!cleanSlug) return `${base}/blogs`
return `${base}/blogs/${encodeURIComponent(cleanSlug)}`
}

async function copyBlogUrl(slug, button){
const shareUrl=buildBlogShareUrl(slug)

try{
if(navigator.clipboard && window.isSecureContext){
await navigator.clipboard.writeText(shareUrl)
}else{
const temp=document.createElement("textarea")
temp.value=shareUrl
temp.setAttribute("readonly", "")
temp.style.position="absolute"
temp.style.left="-9999px"
document.body.appendChild(temp)
temp.select()
document.execCommand("copy")
document.body.removeChild(temp)
}

if(button){
const original=button.textContent
button.textContent="Copied"
setTimeout(()=>{
button.textContent=original || "Copy URL"
}, 1200)
}
}catch(_error){
alert("Could not copy URL. Please copy manually: " + shareUrl)
}
}

function openBlogInNewTab(slug){
const blogUrl=buildBlogShareUrl(slug)
window.open(blogUrl, "_blank", "noopener,noreferrer")
}

function renderBlogsView(data){
currentItems=Array.isArray(data)?data:[]

const container=document.getElementById("messagesView")
container.innerHTML=""

if(currentItems.length===0){
container.innerHTML='<div class="empty-state">No blogs yet.</div>'
return
}

const legend=document.createElement("div")
legend.className="design-legend"
legend.innerHTML=`
<span class="design-legend-item design-1"><span class="design-dot"></span>Design 1</span>
<span class="design-legend-item design-2"><span class="design-dot"></span>Design 2</span>
<span class="design-legend-item design-3"><span class="design-dot"></span>Design 3</span>
`

container.appendChild(legend)

const grid=document.createElement("div")
grid.className="blogs-grid"

currentItems.forEach((blog)=>{
const card=document.createElement("div")
const designNumber=[1,2,3].includes(Number(blog.design_number)) ? Number(blog.design_number) : 1
card.className=`blog-card design-${designNumber}`

const sourceText=String(blog.content || blog.text_sections?.introduction || "")
const excerpt=getBlogExcerpt(sourceText)
const dateLabel=formatBlogDate(blog)
const category=blog.meta?.category || "General"
const author=blog.meta?.author || "Unknown author"
const rawTags=Array.isArray(blog.tags) ? blog.tags : []
const tags=[...new Set(rawTags.map(tag=>String(tag || "").trim()).filter(Boolean))]
const displayTags=(tags.length ? tags : [category]).slice(0, 5)
const tagsMarkup=displayTags
.map(tag=>`<span class="blog-tag" style="${getTagStyle(tag)}">${escapeHtml(tag)}</span>`)
.join("")

const designPalette={
1:{accent:"#2563eb", tint:"#eff6ff"},
2:{accent:"#f97316", tint:"#fff7ed"},
3:{accent:"#8b5cf6", tint:"#f5f3ff"}
}[designNumber]

card.style.setProperty("--card-accent", designPalette.accent)
card.style.setProperty("--card-tint", designPalette.tint)

card.innerHTML=`
<div class="blog-design-row">
<span class="design-badge design-${designNumber}"><span class="design-dot"></span>Design ${designNumber}</span>
</div>
<div class="blog-title">${escapeHtml(blog.title || "Untitled blog")}</div>
<div class="blog-slug">/${escapeHtml(blog.slug || "no-slug")}</div>
<div class="blog-meta">
<span>${escapeHtml(category)}</span>
<span>•</span>
<span>${escapeHtml(author)}</span>
<span>•</span>
<span>${escapeHtml(dateLabel)}</span>
</div>
<div class="blog-tags">${tagsMarkup}</div>
<div class="blog-excerpt">${escapeHtml(excerpt)}</div>
<div class="blog-actions">
<button class="btn btn-edit" onclick="edit('${blog.id}')">Edit</button>
<button class="btn btn-danger" onclick="removeItem('${blog.id}')">Delete</button>
<button class="btn btn-open" onclick="openBlogInNewTab('${escapeHtml(blog.slug || "")}')">Open</button>
<button class="btn btn-share" data-slug="${escapeHtml(blog.slug || "")}" onclick="copyBlogUrl(this.dataset.slug, this)">Copy URL</button>
</div>
`

grid.appendChild(card)
})

container.appendChild(grid)
}

function renderTable(data){

currentItems=Array.isArray(data)?data:[]
setSubscriberActionsVisibility()

const head=document.getElementById("tableHead")
const body=document.getElementById("tableBody")

head.innerHTML=""
body.innerHTML=""

if(data.length===0)return

const isReadOnly=isReadOnlySection()
const columns=isReadOnly?Object.keys(data[0]):Object.keys(data[0]).slice(0,6)

columns.forEach(k=>{
head.innerHTML+=`<th>${k}</th>`
})

if(!isReadOnly){
head.innerHTML+="<th>Actions</th>"
}

data.forEach(row=>{

let tr="<tr>"

columns.forEach(k=>{
tr+=`<td>${formatCellValue(row[k])}</td>`
})

if(!isReadOnly){
tr+=`
<td>
<button class="btn btn-edit" onclick="edit('${row.id}')">Edit</button>
<button class="btn btn-danger" onclick="removeItem('${row.id}')">Delete</button>
</td>
`
}

tr+="</tr>"

body.innerHTML+=tr

})

}

function addResultRow(metric="", value=""){
const container=document.getElementById("resultsRows")

if(!container) return

const row=document.createElement("div")
row.className="result-row"
const metricInput=document.createElement("input")
metricInput.type="text"
metricInput.className="result-metric"
metricInput.placeholder="Metric (e.g. Conversion Rate Increase)"
metricInput.value=metric

const valueInput=document.createElement("input")
valueInput.type="text"
valueInput.className="result-value"
valueInput.placeholder="Value (e.g. 150%)"
valueInput.value=value

const removeBtn=document.createElement("button")
removeBtn.type="button"
removeBtn.className="btn btn-danger btn-small"
removeBtn.textContent="Remove"

removeBtn.addEventListener("click",()=>{
row.remove()
})

row.appendChild(metricInput)
row.appendChild(valueInput)
row.appendChild(removeBtn)

container.appendChild(row)
}

function addBlogPairRow(containerId, firstClass, secondClass, firstPlaceholder, secondPlaceholder, firstValue="", secondValue="", thirdClass, thirdPlaceholder, thirdValue=""){
const container=document.getElementById(containerId)

if(!container) return

const row=document.createElement("div")
row.className= thirdClass ? "result-row three" : "result-row"

const firstInput=document.createElement("input")
firstInput.type="text"
firstInput.className=firstClass
firstInput.placeholder=firstPlaceholder
firstInput.value=firstValue

const secondInput=document.createElement("input")
secondInput.type="text"
secondInput.className=secondClass
secondInput.placeholder=secondPlaceholder
secondInput.value=secondValue

let thirdInput
if(thirdClass){
	thirdInput=document.createElement("input")
	thirdInput.type="text"
	thirdInput.className=thirdClass
	thirdInput.placeholder=thirdPlaceholder
	thirdInput.value=thirdValue || ""
}

const removeBtn=document.createElement("button")
removeBtn.type="button"
removeBtn.className="btn btn-danger btn-small"
removeBtn.textContent="Remove"
removeBtn.addEventListener("click",()=>row.remove())

row.appendChild(firstInput)
row.appendChild(secondInput)
if(thirdInput) row.appendChild(thirdInput)
row.appendChild(removeBtn)

container.appendChild(row)
}

// CTA_ACTION_OPTIONS is defined in constants.js

function addCtaButtonRow(textValue="", actionValue=""){
const container=document.getElementById("ctaButtonsRows")

if(!container) return

const row=document.createElement("div")
row.className="result-row"

const textInput=document.createElement("input")
textInput.type="text"
textInput.className="cta-btn-text"
textInput.placeholder="Button text"
textInput.value=textValue

const actionSelect=document.createElement("select")
actionSelect.className="cta-btn-action"

const placeholderOption=document.createElement("option")
placeholderOption.value=""
placeholderOption.textContent="Select button link"
actionSelect.appendChild(placeholderOption)

CTA_ACTION_OPTIONS.forEach((optionValue)=>{
const option=document.createElement("option")
option.value=optionValue
option.textContent=optionValue
actionSelect.appendChild(option)
})

if(actionValue && !CTA_ACTION_OPTIONS.includes(actionValue)){
const customOption=document.createElement("option")
customOption.value=actionValue
customOption.textContent=`${actionValue} (existing)`
actionSelect.appendChild(customOption)
}

actionSelect.value=actionValue || ""

const removeBtn=document.createElement("button")
removeBtn.type="button"
removeBtn.className="btn btn-danger btn-small"
removeBtn.textContent="Remove"
removeBtn.addEventListener("click",()=>row.remove())

row.appendChild(textInput)
row.appendChild(actionSelect)
row.appendChild(removeBtn)

container.appendChild(row)
}

function getBlogPairRows(containerId, firstSelector, secondSelector, firstKey, secondKey, thirdSelector, thirdKey){
	const rows=document.querySelectorAll(`#${containerId} .result-row`)

	return Array.from(rows)
	.map(row=>{
		const obj={
			[firstKey]: (row.querySelector(`.${firstSelector}`)?.value || "").trim(),
			[secondKey]: (row.querySelector(`.${secondSelector}`)?.value || "").trim()
		}

		if(thirdSelector && thirdKey){
			obj[thirdKey] = (row.querySelector(`.${thirdSelector}`)?.value || "").trim()
		}

		return obj
	})
	.filter(item=>{
		if(thirdKey && Object.prototype.hasOwnProperty.call(item, thirdKey)){
			return item[firstKey] || item[secondKey] || item[thirdKey]
		}
		return item[firstKey] || item[secondKey]
	})
}

function validateRequiredBlogFields(values, status){
const missing=[]

if(!String(values.slug || "").trim()) missing.push("Slug")
if(!String(values.title || "").trim()) missing.push("Title")
if(!String(values.hero_image || "").trim()) missing.push("Hero Image URL")
if(!String(values.quote_content || "").trim()) missing.push("Quote Content")

if(missing.length){
status.innerHTML=`<span class='error'>Please fill: ${missing.join(", ")}</span>`
return false
}

return true
}

function initBlogCollectionEditors(existingData=null){
const steps=Array.isArray(existingData?.steps) ? existingData.steps : []
const infoCards=Array.isArray(existingData?.info_cards) ? existingData.info_cards : []
const ctaButtons=Array.isArray(existingData?.cta?.buttons) ? existingData.cta.buttons : []

const addStepBtn=document.getElementById("addStepBtn")
const addInfoCardBtn=document.getElementById("addInfoCardBtn")
const addCtaButtonBtn=document.getElementById("addCtaButtonBtn")

if(addStepBtn){
addStepBtn.addEventListener("click",()=>addBlogPairRow("stepsRows", "step-title", "step-description", "Step title", "Step description"))
}

if(addInfoCardBtn){
	addInfoCardBtn.addEventListener("click",()=>addBlogPairRow("infoCardsRows", "info-title", "info-content", "Card title", "Card content", "", "", "info-image", "Image URL (optional)"))
}

if(addCtaButtonBtn){
addCtaButtonBtn.addEventListener("click",()=>addCtaButtonRow())
}

if(steps.length){
steps.forEach(item=>addBlogPairRow("stepsRows", "step-title", "step-description", "Step title", "Step description", item.title || "", item.description || ""))
}else{
addBlogPairRow("stepsRows", "step-title", "step-description", "Step title", "Step description")
}

if(infoCards.length){
	infoCards.forEach(item=>addBlogPairRow("infoCardsRows", "info-title", "info-content", "Card title", "Card content", item.title || "", item.content || "", "info-image", "Image URL (optional)", item.image || ""))
}else{
	addBlogPairRow("infoCardsRows", "info-title", "info-content", "Card title", "Card content", "", "", "info-image", "Image URL (optional)")
}

if(ctaButtons.length){
ctaButtons.forEach(item=>addCtaButtonRow(item.text || "", item.action || ""))
}else{
addCtaButtonRow()
}
}

function getResultsFromRows(){
const rows=document.querySelectorAll("#resultsRows .result-row")

return Array.from(rows)
.map(row=>({
metric:(row.querySelector(".result-metric")?.value || "").trim(),
value:(row.querySelector(".result-value")?.value || "").trim()
}))
.filter(item=>item.metric || item.value)
}

function escapeHtml(text){
return String(text || "")
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/\"/g, "&quot;")
.replace(/'/g, "&#39;")
}

function renderMarkdownPreview(text){
let html=escapeHtml(text)

html=html.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
html=html.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
html=html.replace(/^#\s+(.*)$/gm, "<h1>$1</h1>")
html=html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
html=html.replace(/^-\s+(.*)$/gm, "• $1")
html=html.replace(/\n/g, "<br>")

return html
}

function updateContentPreview(){
const contentInput=document.querySelector('#dataForm textarea[name="content"]')
const preview=document.getElementById("contentPreview")

if(!contentInput || !preview) return

if(!contentInput.value.trim()){
preview.innerHTML="<em>Preview will appear here as you type markdown.</em>"
return
}

preview.innerHTML=renderMarkdownPreview(contentInput.value)
}

function updateSlugHint(){
const slugInput=document.querySelector('#dataForm input[name="slug"]')
const slugHint=document.getElementById("slugHint")

if(!slugInput || !slugHint) return

const slug=(slugInput.value || "").trim().toLowerCase()

if(!slug){
slugHint.className="help-text"
slugHint.textContent="Use lowercase words separated by hyphens."
return
}

const duplicate=currentItems.find(item=>
String(item.slug || "").trim().toLowerCase()===slug && (!editId || String(item.id)!==String(editId))
)

if(duplicate){
slugHint.className="help-text error"
slugHint.textContent="This slug already exists."
}else{
slugHint.className="help-text success"
slugHint.textContent="Slug looks good."
}
}

function slugify(text){
return String(text || "")
.toLowerCase()
.trim()
.replace(/[^a-z0-9\s-]/g, "")
.replace(/\s+/g, "-")
.replace(/-+/g, "-")
}

function formatFieldName(name){
if(!name) return "Field"
return String(name)
.replace(/_/g, " ")
.replace(/\b\w/g, c=>c.toUpperCase())
}

function ensureFieldLabels(form){
if(!form) return

const fields=form.querySelectorAll('input[name], textarea[name], select[name]')

fields.forEach((field)=>{
if(field.type==="hidden") return

const prev=field.previousElementSibling
if(prev && prev.classList && prev.classList.contains("field-label")) return

const label=document.createElement("label")
label.className="field-label"
label.textContent=field.getAttribute("placeholder") || formatFieldName(field.name)
field.parentNode.insertBefore(label, field)
})
}

function addTagChip(tag){
const cleanTag=String(tag || "").trim()

if(!cleanTag) return

const chipsContainer=document.getElementById("tagChips")

if(!chipsContainer) return

const existing=getTagsFromChips().map(t=>t.toLowerCase())

if(existing.includes(cleanTag.toLowerCase())) return

const chip=document.createElement("span")
chip.className="tag-chip"

const textNode=document.createElement("span")
textNode.className="tag-chip-text"
textNode.textContent=cleanTag

const removeBtn=document.createElement("button")
removeBtn.type="button"
removeBtn.textContent="x"
removeBtn.addEventListener("click",()=>chip.remove())

chip.appendChild(textNode)
chip.appendChild(removeBtn)
chipsContainer.appendChild(chip)
}

function getTagsFromChips(){
return Array.from(document.querySelectorAll("#tagChips .tag-chip-text"))
.map(el=>el.textContent.trim())
.filter(Boolean)
}

function initTagEditor(tags=[]){
const input=document.getElementById("tagInput")

if(!input) return

tags.forEach(tag=>addTagChip(tag))

const commitInputTags=()=>{
const raw=input.value || ""
raw.split(",").forEach(part=>addTagChip(part))
input.value=""
}

input.addEventListener("keydown",(e)=>{
if(e.key==="Enter" || e.key===","){
e.preventDefault()
commitInputTags()
}
})

input.addEventListener("blur",commitInputTags)
}

function openCreate(existingData=null){

if(isReadOnlySection()) return

editId=existingData && existingData.id ? existingData.id : null

const isEdit=!!editId

let form=document.getElementById("dataForm")

if(current==="blogs"){

form.innerHTML=`
<input name="slug" placeholder="Slug" required>
<div id="slugHint" class="help-text">Use lowercase words separated by hyphens.</div>
<input name="title" placeholder="Title" required>
<select name="design_number" required>
<option value="1">Design 1</option>
<option value="2">Design 2</option>
<option value="3">Design 3</option>
</select>
<input name="hero_badge" placeholder="Hero Badge">
<input name="hero_subtitle" placeholder="Hero Subtitle">
<input name="hero_image" placeholder="Hero Image URL" required>
<input name="meta_author" placeholder="Author">
<input type="datetime-local" name="meta_date">
<input name="meta_category" placeholder="Category">
<input name="meta_intro_img" placeholder="Meta Intro Image URL">
<input name="meta_current_landscape_img" placeholder="Meta Current Landscape Image URL">
<input name="meta_my_perspective_img" placeholder="Meta My Perspective Image URL">
<input name="meta_why_this_matters_img" placeholder="Meta Why This Matters Image URL">
<textarea name="content" placeholder="Markdown Content"></textarea>
<label class="field-label">Content Preview</label>
<div id="contentPreview" class="preview-box"><em>Preview will appear here as you type markdown.</em></div>
<textarea name="text_introduction" placeholder="Introduction"></textarea>
<textarea name="text_current_landscape" placeholder="Current Landscape"></textarea>
<textarea name="text_my_perspective" placeholder="My Perspective"></textarea>
<textarea name="text_why_this_matters" placeholder="Why This Matters"></textarea>
<input name="highlight_title" placeholder="Highlight Box Title">
<textarea name="highlight_content" placeholder="Highlight Box Content"></textarea>
<div class="results-header">
<span class="results-title">Steps</span>
<button type="button" class="btn btn-primary btn-small" id="addStepBtn">Add Step</button>
</div>
<div id="stepsRows"></div>
<div class="results-header">
<span class="results-title">Info Cards</span>
<button type="button" class="btn btn-primary btn-small" id="addInfoCardBtn">Add Card</button>
</div>
<div id="infoCardsRows"></div>
<textarea name="quote_content" placeholder="Quote Content" required></textarea>
<input name="quote_author" placeholder="Quote Author">
<input name="cta_title" placeholder="CTA Title">
<textarea name="cta_description" placeholder="CTA Description"></textarea>
<div class="results-header">
<span class="results-title">CTA Buttons</span>
<button type="button" class="btn btn-primary btn-small" id="addCtaButtonBtn">Add Button</button>
</div>
<div id="ctaButtonsRows"></div>
`

const titleInput=form.querySelector('input[name="title"]')
const slugInput=form.querySelector('input[name="slug"]')

titleInput.addEventListener("input",()=>{
if(!slugInput.value.trim()) slugInput.value=slugify(titleInput.value)
})

}else{

form.innerHTML=`
<input name="slug" placeholder="Slug">
<div id="slugHint" class="help-text">Use lowercase words separated by hyphens.</div>
<input name="title" placeholder="Title">
<input name="client" placeholder="Client">
<input name="industry" placeholder="Industry">
<input name="image" placeholder="Image URL">
<label class="field-label">Tags</label>
<div class="tag-editor">
<div id="tagChips"></div>
<input id="tagInput" type="text" placeholder="Type a tag and press Enter">
</div>
<textarea name="excerpt" placeholder="Excerpt"></textarea>
<textarea name="challenge" placeholder="Challenge"></textarea>
<textarea name="solution" placeholder="Solution"></textarea>
<div class="results-header">
<span class="results-title">Results</span>
<button type="button" class="btn btn-primary btn-small" id="addResultBtn">Add Result</button>
</div>
<div id="resultsRows"></div>
<textarea name="content" placeholder="Content"></textarea>
<label class="field-label">Content Preview</label>
<div id="contentPreview" class="preview-box"><em>Preview will appear here as you type markdown.</em></div>
`

document.getElementById("addResultBtn").addEventListener("click",()=>addResultRow())

const titleInput=form.querySelector('input[name="title"]')
const slugInput=form.querySelector('input[name="slug"]')

titleInput.addEventListener("input",()=>{
if(!slugInput.value.trim()) slugInput.value=slugify(titleInput.value)
})

}

if(existingData){
if(current==="blogs"){
const setField=(name, value)=>{
const node=form.querySelector(`[name="${name}"]`)
if(node && value!==undefined && value!==null) node.value=String(value)
}

setField("slug", existingData.slug)
setField("title", existingData.title)
setField("design_number", String(existingData.design_number || 1))
setField("content", existingData.content)
setField("hero_badge", existingData.hero?.badge)
setField("hero_subtitle", existingData.hero?.subtitle)
setField("hero_image", existingData.hero?.image)
setField("meta_author", existingData.meta?.author)
if(existingData.meta?.date){
const localDate=new Date(existingData.meta.date)
if(!Number.isNaN(localDate.getTime())){
setField("meta_date", localDate.toISOString().slice(0,16))
}
}
setField("meta_category", existingData.meta?.category)
setField("meta_intro_img", existingData.meta?.intro_img)
setField("meta_current_landscape_img", existingData.meta?.current_landscape_img)
setField("meta_my_perspective_img", existingData.meta?.my_perspective_img)
setField("meta_why_this_matters_img", existingData.meta?.why_this_matters_img)
setField("text_introduction", existingData.text_sections?.introduction)
setField("text_current_landscape", existingData.text_sections?.current_landscape)
setField("text_my_perspective", existingData.text_sections?.my_perspective)
setField("text_why_this_matters", existingData.text_sections?.why_this_matters)
setField("highlight_title", existingData.highlight_box?.title)
setField("highlight_content", existingData.highlight_box?.content)
setField("quote_content", existingData.quote?.content)
setField("quote_author", existingData.quote?.author)
setField("cta_title", existingData.cta?.title)
setField("cta_description", existingData.cta?.description)
initBlogCollectionEditors(existingData)
}else{
Array.from(form.elements).forEach(el=>{
if(el.name && existingData[el.name]!==undefined && existingData[el.name]!==null){
if(el.name==="tags" && Array.isArray(existingData.tags)){
// tags are rendered via chips editor
}else if(el.name==="results" && Array.isArray(existingData.results)){
// results are rendered via dynamic rows below
}else{
el.value=existingData[el.name]
}
}
})
}

if(current==="case-studies"){
const results=Array.isArray(existingData.results)?existingData.results:[]
const tags=Array.isArray(existingData.tags)?existingData.tags:[]

initTagEditor(tags)

if(results.length){
results.forEach(item=>addResultRow(item.metric || "", item.value || ""))
}else{
addResultRow()
}
}
}else if(current==="case-studies"){
initTagEditor()
addResultRow()
}else if(current==="blogs"){
initBlogCollectionEditors()
}

const slugInput=form.querySelector('input[name="slug"]')
const contentInput=form.querySelector('textarea[name="content"]')

if(slugInput){
slugInput.addEventListener("input", updateSlugHint)
}

if(contentInput){
contentInput.addEventListener("input", updateContentPreview)
}

ensureFieldLabels(form)

updateSlugHint()
updateContentPreview()

document.getElementById("formTitle").innerText=(isEdit?"Edit ":"Create ")+current
document.getElementById("status").innerHTML=""

openModal()

}

function save(event){

if(isReadOnlySection()) return

if(event) event.preventDefault()

const form=document.getElementById("dataForm")
const status=document.getElementById("status")
const saveBtn=document.getElementById("saveBtn")

if(saveBtn && saveBtn.disabled) return

const setSavingState=(isSaving)=>{
if(!saveBtn) return
if(isSaving){
saveBtn.disabled=true
saveBtn.innerHTML="<span class='btn-loader' aria-hidden='true'></span>Saving..."
return
}
saveBtn.disabled=false
saveBtn.textContent="Save"
}

let data={}

Array.from(form.elements).forEach(el=>{
if(el.name)data[el.name]=el.value
})

if(current==="blogs"){
const cleanValue=(value)=>{
const v=String(value || "").trim()
return v ? v : null
}

if(!validateRequiredBlogFields(data, status)){
return
}

const compactObject=(obj)=>{
const entries=Object.entries(obj).filter(([, value])=>{
if(value===null || value===undefined) return false
if(Array.isArray(value)) return value.length>0
if(typeof value==="string") return value.trim()!==""
return true
})

return entries.length ? Object.fromEntries(entries) : null
}

try{
const steps=getBlogPairRows("stepsRows", "step-title", "step-description", "title", "description")
const infoCards=getBlogPairRows("infoCardsRows", "info-title", "info-content", "title", "content", "info-image", "image")
const ctaButtons=getBlogPairRows("ctaButtonsRows", "cta-btn-text", "cta-btn-action", "text", "action")
const metaDateRaw=cleanValue(data.meta_date)

data={
slug: cleanValue(data.slug) || "",
title: cleanValue(data.title) || "",
design_number: Number.parseInt(String(data.design_number || "1"), 10) || 1,
content: cleanValue(data.content),
hero: compactObject({
badge: cleanValue(data.hero_badge),
subtitle: cleanValue(data.hero_subtitle),
image: cleanValue(data.hero_image)
}),
meta: {
author: cleanValue(data.meta_author),
date: metaDateRaw ? new Date(metaDateRaw).toISOString() : null,
category: cleanValue(data.meta_category),
intro_img: cleanValue(data.meta_intro_img),
current_landscape_img: cleanValue(data.meta_current_landscape_img),
my_perspective_img: cleanValue(data.meta_my_perspective_img),
why_this_matters_img: cleanValue(data.meta_why_this_matters_img)
},
text_sections: compactObject({
introduction: cleanValue(data.text_introduction),
current_landscape: cleanValue(data.text_current_landscape),
my_perspective: cleanValue(data.text_my_perspective),
why_this_matters: cleanValue(data.text_why_this_matters)
}),
highlight_box: compactObject({
title: cleanValue(data.highlight_title),
content: cleanValue(data.highlight_content)
}),
steps: steps.length ? steps : null,
info_cards: infoCards.length ? infoCards : null,
quote: compactObject({
content: cleanValue(data.quote_content),
author: cleanValue(data.quote_author)
}),
cta: compactObject({
title: cleanValue(data.cta_title),
description: cleanValue(data.cta_description),
buttons: ctaButtons.length ? ctaButtons : null
})
}
}catch(err){
status.innerHTML=`<span class='error'>${err.message || "Invalid blogs data"}</span>`
return
}
}

if(current==="case-studies"){
data.tags=getTagsFromChips()

const parsedResults=getResultsFromRows()
const valid=parsedResults.every(item=>item.metric && item.value)

if(!valid){
status.innerHTML="<span class='error'>Each result row needs both metric and value</span>"
return
}

data.results=parsedResults
}

const slug=(data.slug||"").trim().toLowerCase()

if(slug){
const duplicate=currentItems.find(item=>
String(item.slug||"").trim().toLowerCase()===slug && (!editId || String(item.id)!==String(editId))
)

if(duplicate){
status.innerHTML="<span class='error'>Slug already exists</span>"
return
}
}

let url=API+"/"+current+"/"
let method="POST"

if(editId){
url+=editId
method="PUT"
}

authFetch(url,{
method:method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(data)
})
.then(res=>{
return res.json()
.then(data=>({ok:res.ok,data}))
.catch(()=>({ok:res.ok,data:{}}))
})
.then(({ok,data})=>{
setSavingState(false)
if(!ok){
const message=data.detail || "Request failed"
throw new Error(message)
}
status.innerHTML="<span class='success'>Saved successfully</span>"
setTimeout(()=>location.reload(),800)
})
.catch((err)=>{
setSavingState(false)
status.innerHTML=`<span class='error'>${err.message || "Error saving data"}</span>`
})

setSavingState(true)

}

function removeItem(id){

if(isReadOnlySection()) return

if(!confirm("Delete this item?")) return

authFetch(API+"/"+current+"/"+id,{method:"DELETE"})
.then(()=>location.reload())

}

function edit(id){

if(isReadOnlySection()) return

authFetch(API+"/"+current+"/"+id)
.then(res=>{
if(!res.ok) throw new Error("Could not load data for edit")
return res.json()
})
.then(data=>openCreate(data))
.catch((err)=>{
const status=document.getElementById("status")
status.innerHTML=`<span class='error'>${err.message}</span>`
openModal()
})

}

function openModal(){
document.getElementById("modal").style.display="flex"
}

function closeModal(){
document.getElementById("modal").style.display="none"
}

document.addEventListener("keydown",(e)=>{
if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="s"){
const modal=document.getElementById("modal")

if(modal && modal.style.display==="flex"){
e.preventDefault()
save(e)
}
}
})

document.getElementById("loginForm").addEventListener("submit", handleLogin)

const existingToken=getToken()

if(existingToken && !isExpired(existingToken)){
showAdmin()
loadBlogs()
}else{
showLogin()
}
