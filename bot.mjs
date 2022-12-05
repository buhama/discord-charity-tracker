import * as Discord from 'discord.js';
import * as fs from 'fs';

const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent] });

client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}!`);
    const channel = client.channels.cache.get('235211165922230272');
    // Send initial message
    // lastMessage = channel.send('User: owed amount\n@user1: $0\n@user2: $0');

    // Set up event handler for messages in the channel
    client.on('messageCreate', msg => {
      console.log('message', msg);
      if (msg.channel.id === '235211165922230272') {
        console.log('where', msg.content);
        // Check if the message is of the format +5_taggeduser
        if (msg.content === '#showcharity'){
          fs.readFile('data.txt', 'utf8', (err, data) => {
            if (err) {
              console.error(err)
              return
            }
            console.log(data)
            channel.send(data);
          });
        }
        if (msg.content.startsWith('+') || msg.content.startsWith('-') && msg.content.includes('@')) {
          console.log('msg', msg);
          console.log(`Message is of the format +5_taggeduser`);

          //fetch data from data.txt
          fs.readFile('data.txt', 'utf8', (err, data) => {
            if (err) {
              console.error(err)
              return
            }
            console.log(data)
            // Parse data into an array of objects
            const dataArr = data.split('\n').map((line) => {
              const [user, amount] = line.split(':');   
              return { user: user.replace('<@', '').replace('>', ''), amount: amount?.replace('$', '')?.trim() };
            });
            console.log('dataArr', dataArr);

            // Find the user in the array
            const user = dataArr.filter(u => u.user !== '**User').find((user) => user.user === msg.mentions.users.first().id);
            console.log('user', user);

            // if user is found, update the amount
            if (user) {
              //get the number after the + or - and before the space 
              const numberToAdd = msg.content.match(/[-+]\d+/g)[0].replace('+', '').replace('-', '');
              console.log('numberToAdd', numberToAdd);
              if (msg.content.startsWith('+')) {
                user.amount = parseInt(user.amount) + parseInt(numberToAdd);
              } else {
                user.amount = parseInt(user.amount) - parseInt(numberToAdd);
              }
            } else {
              // if user is not found, add them to the array
              dataArr.push({ user: msg.mentions.users.first().id, amount: 5 });
            }

            // Update the data.txt file
            let newData = dataArr.filter(u => u.user !== '**User').map((user) => `<@${user.user}>: $${user.amount}`).join('\n');

            // add a heading to the table
            newData = '**User: owed amount**\n' + newData;
            console.log('newData', newData);
            channel.send(newData);
            fs.writeFile('data.txt', newData, (err) => {
              if (err) {
                console.error(err)
                return
              }
              console.log('File has been updated')
            })       
        });
       }
      }
    });
});
client.login('');
