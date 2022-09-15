// const express = require('express');

import express from 'express'; //jeito de importar mais bunito
import cors from 'cors'; 


import { PrismaClient } from '@prisma/client';
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes';
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string';

const app = express();

app.use(express.json());
app.use(cors());
// app.use(cors({
//     origin: 'http://rocketseat.com.br'
// })); //exemplo em produção


const prisma = new PrismaClient({
    log: ['query']
});

/**
 * Listagem de games com contagem de anúncios
 * Criação de novo anúncio
 * Listagem de anúncios por game
 * Buscar discord pelo ID do anúncio
 */

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    });

    return response.json(games);
});

app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body: any = request.body;

    //Validação

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })

    return response.status(201).json(ad);
});

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true
        },
        where: {
            // gameId: gameId (msm coisa q linha debaixo)
            gameId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd)
        }
    }));

    // return response.json([
    //     { id: 1, name: 'Anúncio 1'},
    //     { id: 2, name: 'Anúncio 2'},
    //     { id: 3, name: 'Anúncio 3'},
    //     { id: 4, name: 'Anúncio 4'},
    // ]);
});

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true
        },
        where: {
            id: adId
        }
    })

    return response.json({
        discord: ad.discord
    });
});

app.listen(3333);