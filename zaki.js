"use strict";
const { downloadContentFromMessage } = require("@adiwajshing/baileys")
const fs = require ("fs");
const cheerio = require("cheerio")
const moment = require("moment-timezone");
const Dym = require("didyoumean");
const util = require("util");
const imageToBase64 = require('image-to-base64');
const { exec, spawn } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const speed = require("performance-now");
const request = require("request");
const FormData = require("form-data");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');
const ms = require("parse-ms");
const toMS = require("ms");
const nou = require("node-os-utils");
let { sizeFormatter } = require("human-readable");
let format = sizeFormatter({
  std: "JEDEC", // 'SI' (default) | 'IEC' | 'JEDEC'
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

// Lib
const { color, bgcolor } = require('./lib/color')
const { getBuffer, fetchJson, fetchText, getRandom, getGroupAdmins, runtime, sleep, generateProfilePicture, reSize, makeid, removeEmojis, calculate_age} = require("./lib/myfunc");
const { 
    addResponGroup,
    checkResponGroup,
    changeResponGroup, 
    deleteResponGroup,
    sendResponGroup
} = require('./lib/respon-group');
const { addResponList, delResponList, isAlreadyResponList, isAlreadyResponListGroup, sendResponList, updateResponList, getDataResponList } = require('./lib/respon-list');
const { addRespons, checkRespons, deleteRespons } = require('./lib/respon');
const { isSetProses, addSetProses, removeSetProses, changeSetProses, getTextSetProses } = require('./lib/setproses');
const { isSetDone, addSetDone, removeSetDone, changeSetDone, getTextSetDone } = require('./lib/setdone');
const { isSetOpen, addSetOpen, removeSetOpen, changeSetOpen, getTextSetOpen } = require("./lib/setopen");
const { isSetClose, addSetClose, removeSetClose, changeSetClose, getTextSetClose } = require("./lib/setclose");

// Database
let pendaftar = JSON.parse(fs.readFileSync('./database/user.json'))
let mess = JSON.parse(fs.readFileSync('./responnya.json'));
let antilink = JSON.parse(fs.readFileSync('./database/antilink.json'));
let listCmd = JSON.parse(fs.readFileSync('./database/listcmd.json'));
let _cmd = JSON.parse(fs.readFileSync('./database/command.json'));
let _cmdUser = JSON.parse(fs.readFileSync('./database/commandUser.json'));
let responDB = JSON.parse(fs.readFileSync('./database/respon.json'));
let listStore = JSON.parse(fs.readFileSync('./database/list-message.json'));
let db_respon_group = JSON.parse(fs.readFileSync('./database/respon-group.json'));


moment.tz.setDefault("Asia/Jakarta").locale("id");

module.exports = async(zaki, msg, m, setting, store, welcome, left, set_welcome_db, set_left_db, db_respon_list, sewa, opengc, set_proses, set_done, set_open, set_close) => {
    try {
        let { ownerNumber, ownerName, botName, footer, group, instagram, gamewaktu, limitCount, sticker: stc } = setting
        let footxt = `${footer} © 2022`
        let thumb = await reSize(fs.readFileSync(setting.pathimg), 200, 200, [])
        const { type, quotedMsg, now, fromMe, mentioned } = msg
        if (msg.isBaileys) return
        const tanggal = moment().tz("Asia/Jakarta").format("dddd, ll")
        const jam = moment().format("HH:mm:ss z")
        let dt = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
        var fildt = dt == 'Pagi' ? dt + '' : dt == 'Siang' ? dt + '' : dt == 'Sore' ? dt + '' : dt + ''
        const ucapanWaktu = fildt.charAt(0).toUpperCase() + fildt.slice(1)
        const content = JSON.stringify(msg.message)
        const from = msg.key.remoteJid
        const chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'documentMessage') && msg.message.documentMessage.caption ? msg.message.documentMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && msg.message.buttonsResponseMessage.selectedButtonId) ? msg.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : (type == "listResponseMessage") ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : (type == "messageContextInfo") ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ''
        const toJSON = j => JSON.stringify(j, null,'\t')
        if (zaki.multi) {
        	var prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '#'
        } else {
        	if (zaki.nopref) {
                prefix = ''
        	} else { 
                prefix = zaki.prefa
        	}
        }
        const args = chats.split(' ')
        const command = chats.toLowerCase().split(' ')[0] || ''
        const isCmd = command.startsWith(prefix)
        const isGroup = msg.key.remoteJid.endsWith('@g.us')
        const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
        const isOwner = ownerNumber.includes(sender)
        const pushname = msg.pushName
        const q = chats.slice(command.length + 1, chats.length)
        const body = chats.startsWith(prefix) ? chats : ''
        const botNumber = zaki.user.id.split(':')[0] + '@s.whatsapp.net'
        const groupMetadata = isGroup ? await zaki.groupMetadata(from) : ''
        const groupName = isGroup ? groupMetadata.subject : ''
        const groupId = isGroup ? groupMetadata.id : ''
        const groupMembers = isGroup ? groupMetadata.participants : ''
        const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const isGroupAdmins = groupAdmins.includes(sender)
        const isUser = pendaftar.includes(sender)
        const isAntiLink = antilink.includes(from) ? true : false

        let timestamp = speed();
        let latensi = speed() - timestamp

        let wangsaf = "0@s.whatsapp.net"

        const mentionByTag = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.mentionedJid : []
        const mentionByReply = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.participant || "" : ""
        const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
        mention != undefined ? mention.push(mentionByReply) : []
        const mentionUser = mention != undefined ? mention.filter(n => n) : []
        
        async function downloadAndSaveMediaMessage (type_file, path_file) {
        	if (type_file === 'image') {
                var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	} else if (type_file === 'video') {
                var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	} else if (type_file === 'sticker') {
                var stream = await downloadContentFromMessage(msg.message.stickerMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	} else if (type_file === 'audio') {
                var stream = await downloadContentFromMessage(msg.message.audioMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	}
        }
        const sendFileFromUrl = async (from, url, caption, options = {}) => {
            let mime = '';
            let res = await axios.head(url)
            mime = res.headerd["content-type"]
            let type = mime.split("/")[0]+"Message"
            if (mime.split("/")[0] === "image") {
               var img = await getBuffer(url)
               return zaki.sendMessage(from, { image: img, caption: caption }, options)
            } else if (mime.split("/")[0] === "video") {
               var vid = await getBuffer(url)
               return zaki.sendMessage(from, { video: vid, caption: caption }, options)
            } else if (mime.split("/")[0] === "audio") {
               var aud = await getBuffer(url)
               return zaki.sendMessage(from, { audio: aud, mimetype: 'audio/mp3' }, options)
            } else {
               var doc = await getBuffer(url)
               return zaki.sendMessage(from, { document: doc, mimetype: mime, caption: caption }, options)
            }
        }
        async function sendPlay(from, query) {
            var url = await yts(query)
            url = url.videos[0].url
            hxz.youtube(url).then(async(data) => {
                var button = [{ urlButton: { displayText: `Source Code`, url: `${url}` } }, { quickReplyButton: { displayText: `Audio`, id: `${prefix}ytmp3 ${url}` } }, { quickReplyButton: { displayText: `Video`, id: `${prefix}ytmp4 ${url}` } }]

                zaki.sendMessage(from, { caption: `*｢  YOUTUBE PLAY  ｣*\n\n❒ *Title :* ${data.title ? data.title : '-'}\n❒ *Quality :* ${data.quality}\n\n_Silahkan Pilih Format yang ada dibawah_`, image: { url: data.thumb }, templateButtons: button, footer: 'Pilih Media Yang Anda Inginkan', mentions: [sender] })
           }).catch((e) => {
               zaki.sendMessage(from, { text: mess.error.api }, { quoted: msg })
               ownerNumber.map( i => zaki.sendMessage(from, { text: `Send Play Error : ${e}` }))
           })
        }
        function hitungmundur(bulan, tanggal) {
            let from = new Date(`${bulan} ${tanggal}, 2022 00:00:00`).getTime();
            let now = Date.now();
            let distance = from - now;
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);
            return days + "Hari " + hours + "Jam " + minutes + "Menit " + seconds + "Detik"
        }
        const isUrl = (url) => {
        	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
        }
        const isEmoji = (emo) => {
            let emoji_ranges = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
            let regexEmoji = new RegExp(emoji_ranges, 'gi');
            return emo.match(regexEmoji)
        }
        function jsonformat(string) {
            return JSON.stringify(string, null, 2)
        }
        function monospace(string) {
            return '```' + string + '```'
        }
        function randomNomor(min, max = null) {
            if (max !== null) {
        	    min = Math.ceil(min);
        	    max = Math.floor(max);
        	    return Math.floor(Math.random() * (max - min + 1)) + min;
            } else {
        	    return Math.floor(Math.random() * min) + 1
            }
        }
        const pickRandom = (arr) => {
        	return arr[Math.floor(Math.random() * arr.length)]
        }
        function mentions(teks, mems = [], id) {
        	if (id == null || id == undefined || id == false) {
        	    let res = zaki.sendMessage(from, { text: teks, mentions: mems })
        	    return res
        	} else {
                let res = zaki.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg })
                return res
            }
        }
        const nebal = (angka) => {
            return Math.floor(angka)
        }
        function parseMention(text = '') {
            return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
        }
        const reply = (teks) => {
        	return zaki.sendMessage(from, { text: teks, mentions: parseMention(teks) }, { quoted: msg })
        }
        
        const fkontak = { key: {fromMe: false,participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {}) }, message: { 'contactMessage': { 'displayName': `${pushname}`, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${pushname},;;;\nFN:${pushname},\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': fs.readFileSync('./media/logo.jpg')}}}
        const textImg = (teks) => {
        	return zaki.sendMessage(from, { text: teks, jpegThumbnail: fs.readFileSync(setting.pathimg), mentions: parseMention(teks) }, { quoted: msg })
        }
        const sendMess = (hehe, teks) => {
        	zaki.sendMessage(hehe, { text, teks })
        }
        const buttonWithText = (from, text, footer, buttons) => {
        	return zaki.sendMessage(from, { text: text, footer: footer, templateButtons: buttons })
        }
        const sendContact = (jid, numbers, name, quoted, mn) => {
        	let number = numbers.replace(/[^0-9]/g, '')
        	const vcard = 'BEGIN:VCARD\n' 
        	+ 'VERSION:3.0\n' 
        	+ 'FN:' + name + '\n'
        	+ 'ORG:;\n'
        	+ 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
        	+ 'END:VCARD'
        	return zaki.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions : mn ? mn : []},{ quoted: quoted })
        }

        async function getGcName(groupID) {
            try {
                let data_name = await zaki.groupMetadata(groupID)
                return data_name.subject
            } catch (err) {
                return '-'
            }
        }

        async function sendStickerFromUrl(from, url, packname1 = stc.packname, author1 = stc.author, options = {}) {
        	var names = Date.now() / 10000;
        	var download = function (uri, filename, callback) {
                request.head(uri, function (err, res, body) {
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	            });
        	};
            exif.create(packname1, author1, `sendstc_${names}`)
        	download(url, './sticker/' + names + '.png', async function () {
                let filess = './sticker/' + names + '.png'
        	    let asw = './sticker/' + names + '.webp'
        	    exec(`ffmpeg -i ${filess} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${asw}`, async (err) => {
        	        exec(`webpmux -set exif ./sticker/sendstc_${names}.exif ${asw} -o ${asw}`, async (error) => {
                        zaki.sendMessage(from, { sticker: fs.readFileSync(asw) }, options)
                        fs.unlinkSync(filess)
                        fs.unlinkSync(asw)
        	        })
                })
        	})
        }

        const buttonsDefault = [
        	{ urlButton: { displayText: `Group Official`, url: `${group}` } }, 	
        ]

        // Anti Link
        if (isGroup && isAntiLink && !isOwner && !isGroupAdmins && isBotGroupAdmins){
            if (chats.match(/(https:\/\/chat.whatsapp.com)/gi)) {
                if (!isBotGroupAdmins) return reply(`Untung bot bukan admin`)
                reply(`*「 GROUP LINK DETECTOR 」*\n\nSepertinya kamu mengirimkan link grup, maaf kamu akan di kick`)
                zaki.groupParticipantsUpdate(from, [sender], "remove")
            }
        }

	    async function addCountCmdUser(nama, sender, u) {
            var posi = null
            var pos = null
            Object.keys(u).forEach((i) => {
                if (u[i].jid === sender) {
                    posi = i
                }
            })
            if (posi === null) {
                u.push({jid: sender, db: [{nama: nama, count: 0}]})
                fs.writeFileSync('./database/commandUser.json', JSON.stringify(u, null, 2));
                Object.keys(u).forEach((i) => {
                    if (u[i].jid === sender) {
                        posi = i
                    }
                })
            }
            if (posi !== null) {
                Object.keys(u[posi].db).forEach((i) => {
                    if (u[posi].db[i].nama === nama) {
                        pos = i
                    }
                })
                if (pos === null) {
                    u[posi].db.push({nama: nama, count: 1})
                    fs.writeFileSync('./database/commandUser.json', JSON.stringify(u, null, 2));
                } else {
                    u[posi].db[pos].count += 1
                    fs.writeFileSync('./database/commandUser.json', JSON.stringify(u, null, 2));
                }
            }
        }

        async function getPosiCmdUser(sender, _db) {
            var posi = null
            Object.keys(_db).forEach((i) => {
                if (_db[i].jid === sender) {
                    posi = i
                }
            })
            return posi
        }

        async function addCountCmd(nama, sender, _db) {
            addCountCmdUser(nama, sender, _cmdUser)
            var posi = null
            Object.keys(_db).forEach((i) => {
                if (_db[i].nama === nama) {
                   posi = i
                }
            })
            if (posi === null) {
                _db.push({nama: nama, count: 1})
                fs.writeFileSync('./database/command.json',JSON.stringify(_db, null, 2));
            } else {
                _db[posi].count += 1
                fs.writeFileSync('./database/command.json',JSON.stringify(_db, null, 2));
            }
        }
if (!isCmd && isGroup && checkResponGroup(from, chats, db_respon_group)) {
            zaki.sendMessage(from, { text: sendResponGroup(from, chats, db_respon_group) }, {
                quoted: msg
            })
        }

        // Store
        if (!isCmd && isGroup && isAlreadyResponList(from, chats, db_respon_list)) {
            var get_data_respon = getDataResponList(from, chats, db_respon_list)
            if (get_data_respon.isImage === false) {
                zaki.sendMessage(from, { text: sendResponList(from, chats, db_respon_list) }, {
                    quoted: msg
                })
            } else {
                zaki.sendMessage(from, { image: await getBuffer(get_data_respon.image_url), caption: get_data_respon.response }, {
                    quoted: msg
                })
            }
        }

        const isImage = (type == 'imageMessage')
        const isVideo = (type == 'videoMessage')
        const isSticker = (type == 'stickerMessage')
        const isQuotedMsg = msg.isQuotedMsg
        const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false
        const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true : false : false
        const isQuotedDocument = isQuotedMsg ? content.includes('documentMessage') ? true : false : false
        const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true : false : false
        const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true : false : false

        // Auto Read & Presence Online
        zaki.sendReadReceipt(from, sender, [msg.key.id])
        zaki.sendPresenceUpdate('available', from)
        const readkey = {
                remoteJid: from,
                id: msg.key.id, // id of the message you want to read
                participant: isGroup ? msg.key.participant : undefined // the ID of the user that sent the  message (undefined for individual chats)
            }
            await zaki.readMessages([readkey]);

        // Auto Registrasi
        if (isCmd && !isUser) {
            pendaftar.push(sender)
            fs.writeFileSync('./database/user.json', JSON.stringify(pendaftar, null, 2))
        }

        // Auto Block +212
        if (sender.startsWith('212')) {
            return zaki.updateBlockStatus(sender, 'block')
        }

        // Mode
        if (zaki.mode === 'self'){
            if (!isOwner && !fromMe) return
        }


		if (chats.startsWith("=> ") && isOwner) {
            console.log(color('[ EVAL ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`Dari Owner aowkoakwoak`))
            const ev = (sul) => {
                var sat = JSON.stringify(sul, null, 2)
                var bang = util.format(sat)
                if (sat == undefined) {
                    bang = util.format(sul)
                }
                return reply(bang)
            }
            try {
                reply(util.format(eval(`;(async () => { ${chats.slice(2)} })()`)))
            } catch (e) {
                reply(util.format(e))
            }
		} else if (chats.startsWith("$ ") && isOwner) {
            console.log(color('[ EXEC ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`Dari Owner aowkoakwoak`))
            exec(chats.slice(2), (err, stdout) => {
                if (err) return reply(`${err}`)
                if (stdout) reply(`${stdout}`)
            })
        } else if (chats.startsWith("> ") && isOwner) {
	        console.log(color('[ EVAL ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`Dari Owner aowkaokwoak`))
        try {
            let evaled = await eval(chats.slice(2))
            if (typeof evaled !== 'string') evaled = require("util").inspect(evaled)
            reply(`${evaled}`)
        } catch (err) {
            reply(`${err}`)
        }
        }

		// Logs
		if (!isGroup && isCmd && !fromMe) {
		    console.log(color('[ CMD ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
		}
		if (isGroup && isCmd && !fromMe) {
		    console.log(color('[ CMD ]'), color(moment(msg.messageTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(groupName))
		}
        function triggerSticker() {
            try {
                for (let x = 0; x < responDB.length; x++) {
                    if (msg.message.stickerMessage.fileSha256.toString('hex') == responDB[x].hex) {
                        return responDB[x].balasan;
                    }
                }
            } catch {
                return false;
            }
        }

// Text Nya
const wiwik = `*MAIN MENU*
 • .owner
 • .script
 
*STORE MENU*
 • .list
 • .addlist
 • .dellist
 • .update
 • .tambah
 • .kurang
 • .kali
 • .bagi

*PROSES/DONE*
 • proses < reply chat >
 • done < reply chat >
 • .setproses
 • .changeproses
 • .delsetproses
 • .setdone
 • .changedone
 • .delsetdone

*GROUP MENU*
 • .linkgc
 • .setppgc
 • .setnamegc
 • .setdesc
 • .antilink
 • .open
 • .close
 • .add
 • .kick
 • .promote
 • .demote
 • .revoke
 • .hidetag

*OWNERS MENU*
 • .join
 • .left
 • .self
 • .public
 • >
 • $
 • =>
 • .setppbot
 • .broadcast`
        
        switch (command || triggerSticker()) {
        
//━━━━━━━━━━━━━━━[ MAIN MENU ]━━━━━━━━━━━━━━━━━//
        case prefix+'menu':
                case prefix+'help':
var hudu = [ 'application/pdf' , 'application/vnd.openxmlformats-officedocument.presentationml.presentation' , 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
let filerdm = hudu[Math.floor(Math.random() * hudu.length)]
let buttons = [
{buttonId: `.owner`, buttonText: {displayText: 'OWNER'}, type: 1},{buttonId: `.sewa`, buttonText: {displayText: 'SEWA BOT'}, type: 1}
]
 let pp = await getBuffer('https://telegra.ph/file/30a330b52fe1f93e6fd3d.jpg')
zaki.sendMessage(from, { document: fs.readFileSync('./media/logo.jpg'), mimetype: filerdm, caption: wiwik, jpegThumbnail: pp, fileName: `Hello ${pushname} 👋.}`, fileLength: '99999999999999999', mentions: [m.sender, "6287734276016@s.whatsapp.net"], buttons: buttons, footer: '© Chitanda - Store', headerType: 4, contextInfo:{externalAdReply:{
showAdAttribution: true,
mediaType: 1,
               title: `Bot WhatsApp Store`,
               renderLargerThumbnail: true,
               thumbnail: pp,
               sourceUrl: 'https://chat.whatsapp.com/L2hJAaHZYPHHkcjFsBr3vE'
}} }, msg)
                   break
        
        case prefix+'owner': case prefix+'dev':
            sendContact(from, ownerNumber.split('@s.whatsapp.net')[0], ownerName, msg)
           .then((res) => zaki.sendMessage(from, { text: 'Itu Nomor Owner Kak.' }, {quoted: res}))
            break
        
//━━━━━━━━━━━━━━━[ STORE MENU ]━━━━━━━━━━━━━━━━━//
        case prefix+'shop': case prefix + 'list':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (db_respon_list.length === 0) return reply(`Belum ada list message di database`)
            if (!isAlreadyResponListGroup(from, db_respon_list)) return reply(`Belum ada list message yang terdaftar di group ini`)
            var arr_rows = [];
            for (let x of db_respon_list) {
                if (x.id === from) {
                    arr_rows.push({
                        title: x.key,
                        rowId: x.key
                    })
                }
            }
            var listMsg = {
                text: `Hi @${sender.split("@")[0]}`,
                buttonText: 'Click Here!',
                footer: `*List From ${groupName}*\n\n⏳ ${jam}\n📆 ${tanggal}`,
                mentions: [sender],
                sections: [{
                    title: groupName, rows: arr_rows
                }]
            }
            zaki.sendMessage(from, listMsg)
            break
        case prefix+'addlist':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            var args1 = q.split("@")[0]
            var args2 = q.split("@")[1]                
            if (!q.includes("@")) return reply(`Gunakan dengan cara ${command} *key@response*\n\n_Contoh_\n\n${command} tes@apa`)
            if (isAlreadyResponList(from, args1, db_respon_list)) return reply(`List respon dengan key : *${args1}* sudah ada di group ini.`)
            if (isImage || isQuotedImage) {
                let media = await downloadAndSaveMediaMessage('image', `./sticker/${sender}`)
                const fd = new FormData();
                fd.append('file', fs.readFileSync(media), '.tmp', '.jpg')
                fetch('https://telegra.ph/upload', {
                    method: 'POST',
                    body: fd
                }).then(res => res.json())
                    .then((json) => {
                        addResponList(from, args1, args2, true, `https://telegra.ph${json[0].src}`, db_respon_list)
                        reply(`Berhasil menambah List menu *${args1}*`)
                        if (fs.existsSync(media)) fs.unlinkSync(media)
                    })
            } else {
                addResponList(from, args1, args2, false, '-', db_respon_list)
                reply(`Berhasil menambah List menu : *${args1}*`)
            }
            break
        case prefix+'dellist':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (db_respon_list.length === 0) return reply(`Belum ada list message di database`)
            if (!q) return reply(`Gunakan dengan cara ${command} *key*\n\n_Contoh_\n\n${command} hello`)
            if (!isAlreadyResponList(from, q, db_respon_list)) return reply(`List respon dengan key *${q}* tidak ada di database!`)
            delResponList(from, q, db_respon_list)
            reply(`Sukses delete list message dengan key *${q}*`)
            break
        case prefix+'updatelist': case prefix+'update':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            var args1 = q.split("@")[0]
            var args2 = q.split("@")[1]
            if (!q.includes("@")) return reply(`Gunakan dengan cara ${command} *key@response*\n\n_Contoh_\n\n${command} tes@apa`)
            if (!isAlreadyResponListGroup(from, db_respon_list)) return reply(`Maaf, untuk key *${args1}* belum terdaftar di group ini`)
            if (isImage || isQuotedImage) {
                let media = await downloadAndSaveMediaMessage('image', `./sticker/${sender}`)
                const fd = new FormData();
                fd.append('file', fs.readFileSync(media), '.tmp', '.jpg')
                fetch('https://telegra.ph/upload', {
                    method: 'POST',
                    body: fd
                }).then(res => res.json())
                    .then((json) => {
                        updateResponList(from, args1, args2, true, `https://telegra.ph${json[0].src}`, db_respon_list)
                        reply(`Berhasil update List menu : *${args1}*`)
                        if (fs.existsSync(media)) fs.unlinkSync(media)
                    })
            } else {
                updateResponList(from, args1, args2, false, '-', db_respon_list)
                reply(`Berhasil update List menu : *${args1}*`)
            }
            break
        case prefix+'tambah':
            if (args.length < 3) return reply(`Gunakan dengan cara ${command} *angka* *angka*\n\n_Contoh_\n\n${command} 1 2`)
            var nilai_one = Number(args[1])
            var nilai_two = Number(args[2])
            reply(`${nilai_one + nilai_two}`)
            break
        case prefix+'kurang':
            if (args.length < 3) return reply(`Gunakan dengan cara ${command} *angka* *angka*\n\n_Contoh_\n\n${command} 1 2`)
            var nilai_one = Number(args[1])
            var nilai_two = Number(args[2])
            reply(`${nilai_one - nilai_two}`)
            break
        case prefix+'kali':
            if (args.length < 3) return reply(`Gunakan dengan cara ${command} *angka* *angka*\n\n_Contoh_\n\n${command} 1 2`)
            var nilai_one = Number(args[1])
            var nilai_two = Number(args[2])
            reply(`${nilai_one * nilai_two}`)
            break
        case prefix+'bagi':
            if (args.length < 3) return reply(`Gunakan dengan cara ${command} *angka* *angka*\n\n_Contoh_\n\n${command} 1 2`)
            var nilai_one = Number(args[1])
            var nilai_two = Number(args[2])
            reply(`${nilai_one / nilai_two}`)
            break
        case prefix+'p': case prefix+'proses':
            if (!isGroup) return ('Hanya Dapat Digunakan Gi Group')
            if (!isOwner && !isGroupAdmins) return ('Hanya Bisa Digunakan Oleh Admin')
            if (!isQuotedMsg) return ('Reply Pesanannya!')
            let proses = `「 *TRANSAKSI PENDING* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM     : ${jam}\n✨ STATUS  : Pending\`\`\`\n\n📝 Catatan :\n${quotedMsg.chats}\n\nPesanan @${quotedMsg.sender.split("@")[0]} sedang di proses!`
            const getTextP = getTextSetProses(from, set_proses);
            if (getTextP !== undefined) {
                mentions(getTextP.replace('pesan', quotedMsg.chats).replace('nama', quotedMsg.sender.split("@")[0]).replace('jam', jam).replace('tanggal', tanggal), [quotedMsg.sender], true)
            } else {
//zaki.sendMessage(`6285878313791@s.whatsapp.net`, {text: proses });
   mentions(proses, [quotedMsg.sender], true)
            }
            break
        case prefix+'d': case prefix+'done':
            if (!isGroup) return ('Hanya Dapat Digunakan Gi Group')
            if (!isOwner && !isGroupAdmins) return ('Hanya Bisa Digunakan Oleh Admin')
            if (!isQuotedMsg) return ('Reply Pesanannya!')
            if (args.length == 1) return reply('Masukan Nomor Pelanggan\nContoh: done 62xxx + Reply Catatannya!')
            let sukses = `「 *TRANSAKSI BERHASIL* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM     : ${jam}\n✨ STATUS  : Berhasil\`\`\`\n\nTerimakasih @${quotedMsg.sender.split("@")[0]} Next Order ya🙏`
            const getTextD = getTextSetDone(from, set_done);
            if (getTextD !== undefined) {
                mentions(getTextD.replace('pesan', quotedMsg.chats).replace('nama', quotedMsg.sender.split("@")[0]).replace('jam', jam).replace('tanggal', tanggal), [quotedMsg.sender], true);
            } else {
await zaki.sendMessage(`${args[1]}@s.whatsapp.net`, {text: sukses });
   mentions(sukses, [quotedMsg.sender], true)
   }
            break
        case prefix+'setproses': case prefix+'setp':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_p*\n\n_Contoh_\n\n${command} pesanan @pesan, tag orang @nama`)
            if (isSetProses(from, set_proses)) return reply(`Set proses already active`)
            addSetProses(q, from, set_proses)
            reply(`Successfully set proses!`)
            break
        case prefix+'changeproses': case prefix+'changep':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_p*\n\n_Contoh_\n\n${command} pesanan @pesan, tag orang @nama`)
            if (isSetProses(from, set_proses)) {
                changeSetProses(q, from, set_proses)
                reply(`Sukses change set proses teks!`)
            } else {
                addSetProses(q, from, set_proses)
                reply(`Sukses change set proses teks!`)
            }
            break
        case prefix+'delsetproses': case prefix+'delsetp':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isSetProses(from, set_proses)) return reply(`Belum ada set proses di sini..`)
            removeSetProses(from, set_proses)
            reply(`Sukses delete set proses`)
            break
        case prefix+'setdone': case prefix+'setd':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_d*\n\n_Contoh_\n\n${command} pesanan @pesan, tag orang @nama`)
            if (isSetDone(from, set_done)) return reply(`Set done already active`)
            addSetDone(q, from, set_done)
            reply(`Successfully set done!`)
            break
        case prefix+'changedone': case prefix+'changed':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!q) return reply(`Gunakan dengan cara ${command} *teks_d*\n\n_Contoh_\n\n${command} pesanan @pesan, tag orang @nama`)
            if (isSetDone(from, set_done)) {
                changeSetDone(q, from, set_done)
                reply(`Sukses change set done teks!`)
            } else {
                addSetDone(q, from, set_done)
                reply(`Sukses change set done teks!`)
            }
            break
        case prefix+'delsetdone': case prefix+'delsetd':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isSetDone(from, set_done)) return reply(`Belum ada set done di sini..`)
            removeSetDone(from, set_done)
            reply(`Sukses delete set done`)
            break

//━━━━━━━━━━━━━━━[ GROUP MENU ]━━━━━━━━━━━━━━━━━//
        case prefix+'linkgrup': case prefix+'link': case prefix+'linkgc':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            var url = await zaki.groupInviteCode(from).catch(() => reply(mess.error.api))
            url = 'https://chat.whatsapp.com/'+url
            reply(url)
            break
        case prefix+'setppgrup': case prefix+'setppgc':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (isImage || isQuotedImage) {
            var media = await downloadAndSaveMediaMessage('image', `ppgc${from}.jpeg`)
            if (args[1] == '\'panjang\'') {
            	var { img } = await generateProfilePicture(media)
            	await zaki.query({
                    tag: 'iq',
                    attrs: {
                        to: from,
                        type:'set',
                        xmlns: 'w:profile:picture'
                    },
                    content: [
                    {
                        tag: 'picture',
                        attrs: { type: 'image' },
                        content: img
                    } 
                    ]
                })
                fs.unlinkSync(media)
            	reply(`Sukses`)
            } else {
                await zaki.updateProfilePicture(from, { url: media })
                .then( res => {
                    reply(`Sukses`)
                    fs.unlinkSync(media)
                }).catch(() => reply(mess.error.api))
            }
            } else {
			    reply(`Kirim/balas gambar dengan caption ${command}`)
            }
            break
        case prefix+'setnamegrup': case prefix+'setnamegc':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} *text*\n\n_Contoh_\n\n${command} Support ${ownerName}`)
            await zaki.groupUpdateSubject(from, q)
            .then( res => {
                reply(`Sukses`)
            }).catch(() => reply(mess.error.api))
            break
        case prefix+'setdesc': case prefix+'setdescription':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (args.length < 2) return reply(`Gunakan dengan cara ${command} *text*\n\n_Contoh_\n\n${command} New Description by ${ownerName}`)
            await zaki.groupUpdateDescription(from, q)
            .then( res => {
                reply(`Sukses`)
            }).catch(() => reply(mess.error.api))
            break
        case prefix+'antilink':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (args.length === 1) return reply(`Pilih enable atau disable`)
            if (args[1].toLowerCase() === 'enable'){
                if (isAntiLink) return reply(`Udah aktif`)
                antilink.push(from)
                fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
                reply('Successfully Activate Antilink In This Group')
            } else if (args[1].toLowerCase() === 'disable'){
                if (!isAntiLink) return reply(`Udah nonaktif`)
                let anu = antilink.indexOf(from)
                antilink.splice(anu, 1)
                fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
                reply('Successfully Disabling Antilink In This Group')
            } else {
                reply(`Pilih enable atau disable`)
            }
            break
        case prefix+'open': case prefix+'buka':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            zaki.groupSettingUpdate(from, 'not_announcement')
            .then((res) => {
                const textOpen = getTextSetOpen(from, set_open);
                if (textOpen !== undefined) {
                    reply(textOpen);
                } else {
                    reply(`Sukses mengizinkan semua peserta dapat mengirim pesan ke grup ini`)
                }
            })
            .catch((err) => reply('Error'))
			break
        case prefix+'close': case prefix+'tutup':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
		    if (!isBotGroupAdmins) return reply(mess.BotAdmin)
		    zaki.groupSettingUpdate(from, 'announcement')
		    .then((res) => {
                const textClose = getTextSetClose(from, set_close);
                if (textClose !== undefined) {
                    reply(textClose);
                } else {
                    reply(`Sukses mengizinkan hanya admin yang dapat mengirim pesan ke grup ini`)
                }
            })
            .catch((err) => reply('Error'))
		    break
        case prefix+'add':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (groupMembers.length == 257) return reply(`Anda tidak dapat menambah peserta, karena Grup sudah penuh!`)
            var mems = []
            groupMembers.map( i => mems.push(i.id) )
            var number;
            if (args.length > 1) {
                number = q.replace(/[^0-9]/gi, '')+"@s.whatsapp.net"
                var cek = await zaki.onWhatsApp(number)
                if (cek.length == 0) return reply(`Masukkan nomer yang valid dan terdaftar di WhatsApp`)
                if (mems.includes(number)) return reply(`Nomer tersebut sudah berada didalam grup!`)
                zaki.groupParticipantsUpdate(from, [number], "add")
                .then( res => reply(jsonformat(res)))
                .catch((err) => reply(jsonformat(err)))
            } else if (isQuotedMsg) {
                number = quotedMsg.sender
                var cek = await zaki.onWhatsApp(number)
                if (cek.length == 0) return reply(`Peserta tersebut sudah tidak terdaftar di WhatsApp`)
                if (mems.includes(number)) return reply(`Nomer tersebut sudah berada didalam grup!`)
                zaki.groupParticipantsUpdate(from, [number], "add")
                .then( res => reply(jsonformat(res)))
                .catch((err) => reply(jsonformat(err)))
            } else {
                reply(`Kirim perintah ${command} nomer atau balas pesan orang yang ingin dimasukkan`)
            }
            break
        case prefix+'kick':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            var number;
			if (mentionUser.length !== 0) {
                number = mentionUser[0]
                zaki.groupParticipantsUpdate(from, [number], "remove")
                .then( res => reply(jsonformat(res)))
                .catch((err) => reply(jsonformat(err)))
            } else if (isQuotedMsg) {
                number = quotedMsg.sender
                zaki.groupParticipantsUpdate(from, [number], "remove")
                .then( res => reply(jsonformat(res)))
                .catch((err) => reply(jsonformat(err)))
            } else {
                reply(`Tag atau balas pesan orang yang ingin dikeluarkan dari grup`)
            }
            break
        case prefix+'promote': case prefix+'pm':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (mentionUser.length !== 0) {
                zaki.groupParticipantsUpdate(from, [mentionUser[0]], "promote")
                .then( res => { mentions(`Sukses menjadikan @${mentionUser[0].split("@")[0]} sebagai admin`, [mentionUser[0]], true) })
                .catch(() => reply(mess.error.api))
            } else if (isQuotedMsg) {
                zaki.groupParticipantsUpdate(from, [quotedMsg.sender], "promote")
                .then( res => { mentions(`Sukses menjadikan @${quotedMsg.sender.split("@")[0]} sebagai admin`, [quotedMsg.sender], true) })
                .catch(() => reply(mess.error.api))
            } else {
                reply(`Tag atau balas pesan member yang ingin dijadikan admin`)
            }
            break
        case prefix+'demote':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            if (mentionUser.length !== 0) {
                zaki.groupParticipantsUpdate(from, [mentionUser[0]], "demote")
                .then( res => { mentions(`Sukses menjadikan @${mentionUser[0].split("@")[0]} sebagai member biasa`, [mentionUser[0]], true) })
                .catch(() => reply(mess.error.api))
            } else if (isQuotedMsg) {
                zaki.groupParticipantsUpdate(from, [quotedMsg.sender], "demote")
                .then( res => { mentions(`Sukses menjadikan @${quotedMsg.sender.split("@")[0]} sebagai member biasa`, [quotedMsg.sender], true) })
                .catch(() => reply(mess.error.api))
            } else {
                reply(`Tag atau balas pesan admin yang ingin dijadikan member biasa`)
            }
            break
        case prefix+'revoke':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins) return reply(mess.GrupAdmin)
            if (!isBotGroupAdmins) return reply(mess.BotAdmin)
            await zaki.groupRevokeInvite(from)
            .then( res => {
                reply(`Sukses menyetel tautan undangan grup ini`)
            }).catch(() => reply(mess.error.api))
            break
        case prefix+'hidetag':
            if (!isGroup) return reply(mess.OnlyGrup)
		    if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            let mem = [];
            groupMembers.map( i => mem.push(i.id) )
            zaki.sendMessage(from, { text: q ? q : '', mentions: mem })
            break
        case prefix+'delete': case prefix+'del': case prefix+'d':
            if (!isGroup) return reply(mess.OnlyGrup)
            if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
            if (!isQuotedMsg) return reply(`Balas chat dari bot yang ingin dihapus`)
            if (!quotedMsg.fromMe) return reply(`Hanya bisa menghapus chat dari bot`)
            zaki.sendMessage(from, { delete: { fromMe: true, id: quotedMsg.id, remoteJid: from }})
            break
        // Owners Menu
        case prefix+'exif':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            var namaPack = q.split('|')[0] ? q.split('|')[0] : q
            var authorPack = q.split('|')[1] ? q.split('|')[1] : ''
            exif.create(namaPack, authorPack)
            reply(`Sukses membuat exif`)
            break
        case prefix+'join':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (args.length < 2) return reply(`Kirim perintah ${command} _linkgrup_`)
            if (!isUrl(args[1])) return reply(mess.error.Iv)
            var url = args[1]
            url = url.split('https://chat.whatsapp.com/')[1]
            var data = await zaki.groupAcceptInvite(url)
            reply(jsonformat(data))
            break
        case prefix+'leave':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (!isGroup) return reply(mess.OnlyGrup)
            zaki.groupLeave(from)
            break
        case prefix+'self':{
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            zaki.mode = 'self'
            reply('Berhasil berubah ke mode self')
            }
            break
        case prefix+'publik': case prefix+'public':{
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            zaki.mode = 'public'
            reply('Berhasil berubah ke mode public')
            }
            break
        case prefix+'setpp': case prefix+'setppbot':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (isImage || isQuotedImage) {
                var media = await downloadAndSaveMediaMessage('image', 'ppbot.jpeg')
                if (args[1] == '\'panjang\'') {
                    var { img } = await generateProfilePicture(media)
                    await zaki.query({
                        tag: 'iq',
                        attrs: {
                            to: botNumber,
                            type:'set',
                            xmlns: 'w:profile:picture'
                        },
                        content: [
                        {
                            tag: 'picture',
                            attrs: { type: 'image' },
                            content: img
                        }
					    ]
                    })
					fs.unlinkSync(media)
					reply(`Sukses`)
				} else {
					var data = await zaki.updateProfilePicture(botNumber, { url: media })
			        fs.unlinkSync(media)
				    reply(`Sukses`)
				}
            } else {
                reply(`Kirim/balas gambar dengan caption ${command} untuk mengubah foto profil bot`)
            }
            break
        case prefix+'broadcast': case prefix+'bc':
            if (!isOwner && !fromMe) return reply(mess.OnlyOwner)
            if (args.length < 2) return reply(`Kirim perintah ${command} teks`)
            var data = await store.chats.all()
            var teks = `${q}`
            for (let i of data) {
                zaki.sendMessage(i.id, { text: teks })
                await sleep(1000)
            }
            reply(`Sukses mengirim pesan siaran kepada ${data.length} chat`)
            break
case prefix + 'delrespon':
                if (!isGroup) return reply(mess.OnlyGrup)
                if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
                if (!args[1]) return reply(`Gunakan dengan cara ${command} *key*\n\n_Contoh_\n\n${command} tes`)
                if (!checkResponGroup(from, args[1], db_respon_group)) return reply(`key *${args[1]}* tidak ada didatabase..`)

                try {
                    deleteResponGroup(from, args[1], db_respon_group)
                    reply(`Sukses Delete Auto Response Di Group ini Dengan Key *${args[1]}*`)
                } catch (err) {
                    reply(mess.error.api)
                    console.log(color('[ERROR]', 'red'), err)
                }
                break
            case prefix + 'changerespon':
            case prefix + 'set':
                if (!isGroup) return reply(mess.OnlyGrup)
                if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
                let azu = `${q.split("@")[0]}`
                let aze = `${q.split("@")[1]}`
                if (!q.includes("@")) return reply(`Gunakan dengan cara ${command} *key@response*\n\n_Contoh_\n\n${command} tes@iya`)
                if (!checkResponGroup(from, azu, db_respon_group)) return reply(`Key *${azu}* tidak ada didatabase...`)

                try {
                    changeResponGroup(from, azu, aze, db_respon_group)
                    reply(`Berhasil Sukses Update respon *${azu}*`)
                } catch (err) {
                    reply(mess.error.api)
                    console.log(color('[ERROR]', 'red'), err)
                }
                break
            case prefix + 'addrespon':
                if (!isGroup) return reply(mess.OnlyGrup)
                if (!isGroupAdmins && !isOwner) return reply(mess.GrupAdmin)
                let aza = `${q.split("@")[0]}`
                let azi = `${q.split("@")[1]}`
                if (!q.includes("@")) return reply(`Gunakan dengan cara ${command} *key@response*\n\n_Contoh_\n\n${command} tes@apa`)
                if (checkResponGroup(from, aza, db_respon_group)) return reply(`Key *${aza}* Sudah ada di group ini...`)
                
                try {
                    addResponGroup(from, aza, azi, db_respon_group)
                    reply(`Berhasil Menambah respon *${aza}*`)
                } catch (err) {
                    reply(mess.error.api)
                    console.log(color('[ERROR]', 'red'), err)
                }
                break
        
            
            
            

default:
if (isCmd) {
    if (args[0].length > 1) {
        var detect = await Dym(command.split(prefix)[1], listCmd)
        if (detect !== null) {
            reply(`Mungkin yang anda maksud adalah ${prefix + detect} abaikan jika salah!`)
        }
        if (!isGroup && detect === null) {
            reply(`Maaf kak fitur ${command} tidak terdaftar di list ${prefix+'menu'}`)
        }
    } else {
        var detect2 = await Dym(args[1], listCmd)
        if (!isGroup && detect2 !== null) {
            reply(`Pastikan antara simbol/prefix jangan dipisah, contoh ${prefix+args[1]}`)
        }
	}
}
}
    } catch (err) {
        console.log(color('[ ERROR ]', 'red'), err)
    }
}
