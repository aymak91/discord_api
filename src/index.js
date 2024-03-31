require('dotenv').config();
const express = require('express');
const axios = require('axios');
const url = require('url');

const port = process.env.PORT || 1500;
const app = express();

app.get('/api/auth/discord/redirect', async (req, res) => {
    const {code} = req.query;
    if (code) {
        const formData = new url.URLSearchParams({
            client_id: process.env.ClientID,
            client_secret: process.env.ClientSecret,
            grant_type: 'authorization_code',
            code: code.toString(),
            redirect_uri: 'http://localhost:1500/api/auth/discord/redirect',
        });

        const output = await axios.post('https://discord.com/api/v10/oauth2/token',
            formData,{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
        });

        if (output.data) {
            const access = output.data.access_token;
            const userInfo = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: {
                    'Authorization': `Bearer ${access}`,
                },
            });

            const userServerInfo = await axios.get('https://discord.com/api/v10//users/@me/guilds/829573154925445131/member', {
                headers: {
                    'Authorization': `Bearer ${access}`,
                },
            });
            
            // refresh token
            const formData1 = new url.URLSearchParams({
                client_id: process.env.ClientID,
                client_secret: process.env.ClientSecret,
                grant_type: 'refresh_token',
                refresh_token: output.data.refresh_token,
            });
            
            const refresh = await axios.post('https://discord.com/api/v10/oauth2/token',
            formData1,{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            console.log('output data:', output.data);
            console.log('user data:', userInfo.data);
            console.log('user-server data:', userServerInfo.data);
            console.log('refresh data:', refresh.data);
            console.log(userServerInfo.data.roles.includes('1199603063552495701'))
            return userServerInfo.data.roles.includes('1199603063552495701')
        };
    };
});

app.listen(port, () => {console.log(`Running on ${port}`)});