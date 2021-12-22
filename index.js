const { create, Client } = require('@open-wa/wa-automate')
const figlet = require('figlet')
const options = require('./utils/options')
const { color, messageLog } = require('./utils')
const HandleMsg = require('./HandleMsg')

const start = (aruga = new Client()) => {
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('bodysuit', { font: 'Ghost', horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color('[DEV]'), color('bodysuit', 'yellow'))
    console.log(color('[~>>]'), color('BOT Started!', 'green'))

    // Mempertahankan sesi agar tetap nyala
    Bodysuit.onStateChanged((state) => {
        console.log(color('[~>>]', 'red'), state)
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') aruga.forceRefocus()
    })

    // ketika bot diinvite ke dalam group
    aruga.onAddedToGroup(async (chat) => {
	const groups = await aruga.getAllGroups()
	// kondisi ketika batas group bot telah tercapai,ubah di file settings/setting.json
	if (groups.length > groupLimit) {
	await bodysuit.sendText(chat.id, `Sorry, the group on this Bot is full\nMax Group is: ${groupLimit}`).then(() => {
	      Bodysuit.leaveGroup(chat.id)
	      Bodysuit.deleteChat(chat.id)
	  }) 
	} else {
	// kondisi ketika batas member group belum tercapai, ubah di file settings/setting.json
	    if (chat.groupMetadata.participants.length < memberLimit) {
	    await bodysuit.sendText(chat.id, `Sorry, Bot comes out if the group members do not exceed ${memberLimit} people`).then(() => {
	      Bodysuit.leaveGroup(chat.id)
	      Bodysuit.deleteChat(chat.id)
	    })
	    } else {
        await bodysuit.simulateTyping(chat.id, true).then(async () => {
          await bodysuit.sendText(chat.id, `Hai minna~, Im bodysuit Bot. To find out the commands on this bot type ${prefix}menu`)
        })
	    }
	}
    })

    // ketika seseorang masuk/keluar dari group
    aruga.onGlobalParicipantsChanged(async (event) => {
        const host = await bodysuit.getHostNumber() + '@c.us'
		const welcome = JSON.parse(fs.readFileSync('./settings/welcome.json'))
		const isWelcome = welcome.includes(event.chat)
		let profile = await bodysuit.getProfilePicFromServer(event.who)
		if (profile == '' || profile == undefined) profile = 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTQcODjk7AcA4wb_9OLzoeAdpGwmkJqOYxEBA&usqp=CAU'
        // kondisi ketika seseorang diinvite/join group lewat link
        if (event.action === 'add' && event.who !== host && isWelcome) {
			await bodysuit.sendFileFromUrl(event.chat, profile, 'profile.jpg', '')
            await bodysuit.sendTextWithMentions(event.chat, `Hello, Welcome to the group @${event.who.replace('@c.us', '')} \n\nHave fun with us✨`)
        }
        // kondisi ketika seseorang dikick/keluar dari group
        if (event.action === 'remove' && event.who !== host) {
			await bodysuit.sendFileFromUrl(event.chat, profile, 'profile.jpg', '')
            await bodysuit.sendTextWithMentions(event.chat, `Good bye @${event.who.replace('@c.us', '')}, We'll miss you✨`)
        }
    })

    aruga.onIncomingCall(async (callData) => {
        // ketika seseorang menelpon nomor bot akan mengirim pesan
        await bodysuit.sendText(callData.peerJid, 'Maaf sedang tidak bisa menerima panggilan.\n\n-bot')
        .then(async () => {
            // bot akan memblock nomor itu
            await bodysuit.contactBlock(callData.peerJid)
        })
    })

    // ketika seseorang mengirim pesan
    Bodysuit.onMessage(async (message) => {
        Bodysuit.getAmountOfLoadedMessages() // menghapus pesan cache jika sudah 3000 pesan.
            .then((msg) => {
                if (msg >= 3000) {
                    console.log('[aruga]', color(`Loaded Message Reach ${msg}, cuting message cache...`, 'yellow'))
                    Bodysuit.cutMsgCache()
                }
            })
        HandleMsg(aruga, message)    
    
    })
	
    // Message log for analytic
    Bodysuit.onAnyMessage((anal) => { 
        messageLog(anal.fromMe, anal.type)
    })
}

//create session
create(options(true, start))
    .then((bodysuit) => start(bodysuit))
    .catch((err) => new Error(err))
