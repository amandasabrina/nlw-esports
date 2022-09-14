// const express = require('express');

import express from 'express'; //jeito de importar mais bunito

const app = express();

app.get('/ads', (request, response) => {
    return response.json([
        { id: 1, name: 'Anúncio 1'},
        { id: 2, name: 'Anúncio 2'},
        { id: 3, name: 'Anúncio 3'},
        { id: 4, name: 'Anúncio 4'},
    ]);
});

app.listen(3333);