function $(i){return document.getElementById(i);}
var bg=opera.extension.bgProcess,N=$('main'),L=$('sList'),O=$('overlay'),_=bg.getI18nString;
function getDate(t){var d=new Date();d.setTime(t*1000);return d.toDateString();}
function getTime(r){
	var d=new Date(),z,m=r.updated.match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+):(\d+)\s+(\+|-)(\d+)/);
	d.setUTCFullYear(parseInt(m[1],10));
	d.setUTCMonth(parseInt(m[2],10)-1);
	d.setUTCDate(parseInt(m[3],10));
	d.setUTCHours(parseInt(m[4],10));
	d.setUTCMinutes(parseInt(m[5],10));
	d.setUTCSeconds(parseInt(m[6],10));
	d.setUTCMilliseconds(0);
	d=d.getTime()/1000;
	z=parseInt(m[8].substr(0,2),10)*60+parseInt(m[8].substr(2),10);z*=60;
	if(m[7]!='-') z=-z;d+=z;
	return d;
}
function getName(n){
	return n.name?n.name.replace(/&/g,'&amp;').replace(/</g,'&lt;'):'<em>'+_('Null name')+'</em>';
}
function fillHeight(e,b,p){
	if(p==undefined) p=e.parentNode;
	b=b?b.offsetTop+b.offsetHeight:0;
	e.style.pixelHeight=e.offsetHeight+window.getComputedStyle(p).pixelHeight-b;
}
fillHeight(L,$('footer'),document.body);

// Main options
function loadName(d,n){
	var a=d.firstChild;
	if(n.url) a.href=n.url;
	a.title=n.name;
	a.innerHTML=getName(n);
}
function loadItem(d,n,m){
	d.innerHTML='<a class="name ellipsis"></a>'
	+'<span class=updated>'+(n.updated?_('Last updated: ')+getDate(n.updated):'')+'</span>'
	+(n.metaUrl?'<a href=# data=update class=update>'+_('Check for updates')+'</a> ':'')
	+'<span class=message></span>'
	+'<div class=panel>'
		+'<button data=edit>'+_('Edit')+'</button> '
		+'<button data=enable>'+(n.enabled?_('Disable'):_('Enable'))+'</button> '
		+'<button data=remove>'+_('Remove')+'</button>'
	+'</div>';
	d.className=n.enabled?'':'disabled';
	loadName(d,n);
	if(m) d.querySelector('.message').innerHTML=m;
}
function addItem(n){
	var d=document.createElement('div');
	loadItem(d,n);
	L.appendChild(d);
	return d;
}
L.onclick=function(e){
	var o=e.target,d=o.getAttribute('data'),p;
	if(!d) return;
	e.preventDefault();
	for(p=o;p&&p.parentNode!=L;p=p.parentNode);
	var i=Array.prototype.indexOf.call(L.childNodes,p);
	switch(d){
		case 'edit':
			edit(i);
			break;
		case 'enable':
			e=bg.map[bg.ids[i]];
			if(e.enabled=!e.enabled) {
				p.classList.remove('disabled');
				o.innerText=_('Disable');
			} else {
				p.classList.add('disabled');
				o.innerText=_('Enable');
			}
			bg.saveStyle(e);
			break;
		case 'remove':
			bg.removeStyle(i);
			L.removeChild(p);
			break;
		case 'update':
			check(i);
			break;
	}
};
$('bNew').onclick=function(){var d=bg.newStyle(null,true);addItem(d);};
$('bUpdate').onclick=function(){for(var i=0;i<bg.ids.length;i++) if(bg.map[bg.ids[i]].metaUrl) check(i);};
var panel=N;
function switchTo(D){
	panel.classList.add('hide');D.classList.remove('hide');panel=D;
}
var dialogs=[];
function showDialog(D,z){
	if(!dialogs.length) O.classList.remove('hide');
	if(!z) z=dialogs.length?dialogs[dialogs.length-1].zIndex+1:1;
	dialogs.push(D);
	O.style.zIndex=D.style.zIndex=D.zIndex=z;
	D.classList.remove('hide');
	D.style.top=(window.innerHeight-D.offsetHeight)/2+'px';
	D.style.left=(window.innerWidth-D.offsetWidth)/2+'px';
}
function closeDialog(){
	dialogs.pop().classList.add('hide');
	if(dialogs.length) O.style.zIndex=dialogs.length>1?dialogs[dialogs.length-1]:1;
	else O.classList.add('hide');
}
O.onclick=function(){
	if(dialogs.length) (dialogs[dialogs.length-1].close||closeDialog)();
};
function confirmCancel(dirty){
	return !dirty||confirm(_('Modifications are not saved!'));
}
function bindChange(e,d){
	function change(){d.forEach(function(i){i.dirty=true;});}
	e.forEach(function(i){i.onchange=change;});
}
window.addEventListener('DOMContentLoaded',function(){
	var nodes=document.querySelectorAll('.i18n'),c,s,i,j;
	for(i=0;i<nodes.length;i++)
		nodes[i].innerHTML=opera.extension.bgProcess.getI18nString(nodes[i].innerHTML);
},true);

// Advanced
var A=$('advanced');
$('bAdvanced').onclick=function(){showDialog(A);};
$('cShow').checked=bg.getItem('showButton',true);
$('cShow').onchange=function(){bg.showButton(bg.setItem('showButton',this.checked));};
$('cInstall').checked=bg.getItem('installFile',true);
$('cInstall').onchange=function(){bg.setItem('installFile',this.checked);};
$('aExport').onclick=function(){showDialog(X);xLoad();};
$('aImport').onchange=function(e){
	var i,f,files=e.target.files;
	for(i=0;f=files[i];i++) {
		var r=new FileReader();
		r.onload=function(e){impo(e.target.result);};
		r.readAsBinaryString(f);
	}
};
A.close=$('aClose').onclick=closeDialog;

// Import
function impo(b){
	var z=new JSZip(),count=0;
	try{z.load(b);}catch(e){alert(_('Error loading zip file.'));return;}
	z.file(/\.user\.css/).forEach(function(o){
		if(o.dir) return;
		try{
			var r=bg.parseFirefoxCSS(null,{code:o.asText()});
			if(!r) count++;
		}catch(e){opera.postError('Error importing data: '+o.name+'\n'+e);}
	});
	alert(bg.format(_('$1 item(s) are imported.'),count));
}

// Export
var X=$('export'),xL=$('xList'),xE=$('bExport');
function xLoad() {
	xL.innerHTML='';xE.disabled=false;xE.innerHTML=_('Export');
	bg.ids.forEach(function(i){
		var d=document.createElement('div');
		d.className='ellipsis';
		d.title=bg.map[i].name;
		d.innerHTML=getName(bg.map[i]);
		xL.appendChild(d);
	});
}
xL.onclick=function(e){
	var t=e.target;
	if(t.parentNode!=this) return;
	t.classList.toggle('selected');
};
$('bSelect').onclick=function(){
	var c=xL.childNodes,v,i;
	for(i=0;i<c.length;i++) if(!c[i].classList.contains('selected')) break;
	v=i<c.length;
	for(i=0;i<c.length;i++) if(v) c[i].classList.add('selected'); else c[i].classList.remove('selected');
};
function getCSS(c){
	var d=[];
	['id','name','url','metaUrl','updateUrl','updated','enabled'].forEach(function(i){
		if(c[i]!=undefined) d.push('/* @'+i+' '+String(c[i]).replace(/\*/g,'+')+' */');
	});
	c.data.forEach(function(i){
		var p=[];
		i.domains.forEach(function(j){p.push('domain('+JSON.stringify(j)+')');});
		i.regexps.forEach(function(j){p.push('regexp('+JSON.stringify(j)+')');});
		i.urlPrefixes.forEach(function(j){p.push('url-prefix('+JSON.stringify(j)+')');});
		i.urls.forEach(function(j){p.push('url('+JSON.stringify(j)+')');});
		d.push('@-moz-document '+p.join(',\n')+'{\n'+i.code+'\n}\n');
	});
	return d.join('\n');
}
$('bExport').onclick=function(){
	this.disabled=true;this.innerHTML=_('Exporting...');
	var z=new JSZip(),n,_n,names={},c,i,j;
	for(i=0;i<bg.ids.length;i++) if(xL.childNodes[i].classList.contains('selected')) {
		c=bg.map[bg.ids[i]];n=_n=c.name||'Noname';j=0;
		while(names[n]) n=_n+(++j);names[n]=1;
		z.file(n+'.user.css',getCSS(c));
	}
	n=z.generate({compression:'DEFLATE'});
	window.open('data:application/zip;base64,'+n);
	X.close();
};
X.close=$('bClose').onclick=closeDialog;

// Update checker
function check(i){
	var l=L.childNodes[i],o=l.querySelector('[data=update]'),m=l.querySelector('.message'),c=bg.map[bg.ids[i]],d;
	m.innerHTML=_('Checking for updates...');
	o.classList.add('hide');
	function update(){
		m.innerHTML=_('Updating...');
		bg.fetchURL(c.updateUrl,function(){
			var r=bg.parseCSS(null,{status:this.status,id:c.id,updated:d,code:this.responseText});
			if(r) m.innerHTML=r;
			o.classList.remove('hide');
		});
	}
	bg.fetchURL(c.metaUrl,function(){
		try {
			d=getTime(JSON.parse(this.responseText));
			if(!c.updated||c.updated<d) {
				if(c.updateUrl) return update();
				else m.innerHTML='<a class=new title="'+_('Please go to homepage for update since there are options for this style.')+'">'+_('New version found.')+'</a>';
			} else m.innerHTML=_('No update found.');
		} catch(e) {
			m.innerHTML=_('Failed fetching update information.');
			opera.postError(e);
		}
		o.classList.remove('hide');
	});
}

// Style Editor
var M=$('editor'),S=$('mSection'),I=$('mName'),
    rD=$('mDomain'),rR=$('mRegexp'),rP=$('mUrlPrefix'),rU=$('mUrl'),
    dM=$('mDeMoz'),dW=$('mDeWebkit');
function editor(e,i){
	var t=this;
	t.clean=true;
	e.onchange=function(){t.clean=false;};
	e.isClean=function(){return t.clean;};
	e.markClean=function(){t.clean=true;};
	e.getValue=function(){return this.value;};
	e.setValue=function(v){this.value=v;};
	t.editor=t.textarea=e;
	t.type=0;
	t.switchEditor(i?1:0);
}
editor.prototype={
	switchEditor:function(i){
		if(i==undefined) i=!this.type;
		if(i!=this.type) {
			if(this.type=!this.type)
				this.editor=CodeMirror.fromTextArea(this.editor,{
					lineNumbers:true,
					matchBrackets:true,
					mode:'text/css',
					lineWrapping:true,
					indentUnit:4,
					indentWithTabs:true,
					extraKeys:{"Enter":"newlineAndIndentContinueComment"}
				});
			else {
				this.clean&=this.editor.isClean();
				this.editor.toTextArea();this.editor=this.textarea;
			}
			this.type=i;
		}
	},
	resize:function(){
		var w=this.getWrapperElement();
		fillHeight(w,w.nextElementSibling);
		if(this.type) w.style.width=w.parentNode.clientWidth+'px';
	},
	isClean:function(){return this.clean&&this.editor.isClean();},
	markClean:function(){this.clean=true;this.editor.markClean();},
	getValue:function(){return this.editor.getValue();},
	setValue:function(t){this.editor.setValue(t);this.editor.getDoc&&this.editor.getDoc().clearHistory();},
	getWrapperElement:function(e){e=this.editor;return e.getWrapperElement?e.getWrapperElement():e;},
};
var T=new editor($('mCode'),bg.getItem('editorType',0));
(function (b){
	function switchCommand(){
		b.innerHTML=T.type?_('Switch to normal editor'):_('Switch to advanced editor');
	}
	b.onclick=function(){
		T.switchEditor();T.resize();bg.setItem('editorType',T.type);switchCommand();
	};
	switchCommand();
})($('beditor'));
function cloneData(d){
	var c=[];
	d.forEach(function(i){
		if(i.code) c.push({
			domains:i.domains.concat(),
			regexps:i.regexps.concat(),
			urlPrefixes:i.urlPrefixes.concat(),
			urls:i.urls.concat(),
			code:i.code
		});
	});
	return c;
}
function edit(i){
	switchTo(M);fillHeight(S,S.nextElementSibling);
	M.cur=i;M.dirty=false;M.css=bg.map[bg.ids[M.cur]];
	M.data=cloneData(M.css.data);
	S.innerHTML='';S.cur=0;S.dirty=false;
	I.value=M.css.name;
	for(var i=0;i<M.data.length;i++) mAddItem(i+1);
	dM.checked=M.css.deprefix.indexOf('-moz-')>=0;
	dW.checked=M.css.deprefix.indexOf('-webkit-')>=0;
	T.resize();mShow();
}
function mAddItem(n){
	var d=document.createElement('div');
	d.innerText=n;
	S.appendChild(d);
	return d;
}
function split(t){return t.replace(/^\s+|\s+$/g,'').split(/\s*\n\s*/).filter(function(e){return e;});}
function mSection(r){
	if(M.data[S.cur]){
		if(S.dirty){
			S.dirty=false;
			M.data[S.cur].domains=split(rD.value);
			M.data[S.cur].regexps=split(rR.value);
			M.data[S.cur].urlPrefixes=split(rP.value);
			M.data[S.cur].urls=split(rU.value);
		}
		if(!T.isClean()) {
			M.data[S.cur].code=T.getValue();T.markClean();M.dirty=true;
		}
		if(r) S.childNodes[S.cur].classList.remove('selected');
	}
}
function mSave(){
	if(M.dirty||!T.isClean()){
		M.css.name=I.value;
		mSection();
		var d=M.css.deprefix=[];
		if(dM.checked) d.push('-moz-');
		if(dW.checked) d.push('-webkit-');
		M.dirty=false;
		return true;
	} else return false;
}
function mShow(){
	var c=S.childNodes[S.cur];
	rD.disabled=rR.disabled=rP.disabled=rU.disabled=T.getWrapperElement().disabled=!c;
	if(c) {
		S.childNodes[S.cur].classList.add('selected');
		rD.value=M.data[S.cur].domains.join('\n');
		rR.value=M.data[S.cur].regexps.join('\n');
		rP.value=M.data[S.cur].urlPrefixes.join('\n');
		rU.value=M.data[S.cur].urls.join('\n');
		T.setValue(M.data[S.cur].code);
	} else T.setValue(rD.value=rR.value=rP.value=rU.value='');
	T.markClean();
}
function mClose(){
	switchTo(N);
	loadName(L.childNodes[M.cur],bg.map[bg.ids[M.cur]]);
	M.cur=M.css=null;
}
bindChange([rD,rR,rP,rU],[M,S]);
bindChange([I,$('mDeMoz'),$('mDeWebkit')],[M]);
S.onclick=function(e){
	var t=e.target;
	if(t.parentNode!=this) return;
	mSection(1);S.cur=Array.prototype.indexOf.call(S.childNodes,t);
	if(!t.classList.contains('selected')) mShow();
};
$('mNew').onclick=function(){
	var d={domains:[],regexps:[],urlPrefixes:[],urls:[],code:''};
	mSection(1);
	S.cur=M.data.length;
	M.data.push(d);
	mAddItem(M.data.length);
	mShow();
};
$('mDel').onclick=function(){
	if(S.cur) {
		M.data.splice(S.cur,1);
		S.removeChild(S.lastChild);
		mShow();M.dirty=true;
	}
};
$('mSave').onclick=function(){
	if(mSave()) {M.css.data=cloneData(M.data);bg.saveStyle(M.css);}
};
$('mSaveClose').onclick=function(){
	if(mSave()) {M.css.data=M.data;bg.saveStyle(M.css);}
	mClose();
};
M.close=$('mClose').onclick=function(){if(confirmCancel(M.dirty||!T.isClean())) mClose();};

// Load at last
L.innerHTML='';
bg.ids.forEach(function(i){addItem(bg.map[i]);});
function updateItem(t,i,r){
	var p=L.childNodes[i],n=bg.map[bg.ids[i]];
	switch(t){
		case 'add':addItem(n);break;
		case 'update':loadItem(p,n,r);break;
	}
};
if(bg.optionsWindow!==window) try{bg.optionsWindow.close();}catch(e){}
bg.optionsWindow=window;
