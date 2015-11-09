'use strict';

var expect = require('chai').expect;
var robbery = require('../robbery');

describe('Базовое тестирование объекта moment', function () {
    it('format()', function () {
        var gang = require('fs').readFileSync('gang.json', 'utf-8');

        var robberyMoment = robbery.getAppropriateMoment(gang, 90, {
            from: '09:00+5',
            to: '21:00+5'
        });

        var actual = robberyMoment.format(
            'Ограбление должно состоятся в %DD. Всем быть готовыми к %HH:%MM!'
        );

        expect(actual).to.be.equal(
            'Ограбление должно состоятся в ВТ. Всем быть готовыми к 16:00!'
        );
    });

    it('format()', function () {
        var gang = require('fs').readFileSync('gang.json', 'utf-8');

        var robberyMoment = robbery.getAppropriateMoment(gang, 60, {
            from: '23:00+5',
            to: '00:00+5'
        });

        var actual = robberyMoment.format(
            'Ограбление должно состоятся в %DD. Всем быть готовыми к %HH:%MM!'
        );

        expect(actual).to.be.equal(
            'Ограбление должно состоятся в СР. Всем быть готовыми к 23:00!'
        );
    });
    it('format()', function () {
        var gang = require('fs').readFileSync('gang.json', 'utf-8');

        var robberyMoment = robbery.getAppropriateMoment(gang, 600, {
            from: '09:00+5',
            to: '21:00+5'
        });

        var actual = robberyMoment.format(
            'Ограбление должно состоятся в %DD. Всем быть готовыми к %HH:%MM!'
        );

        expect(actual).to.be.equal(
            'Ограбление должно состоятся в ЧТ. Всем быть готовыми к 09:00!'
        );
    });
    it('format()', function () {
        var gang = require('fs').readFileSync('gang.json', 'utf-8');

        var robberyMoment = robbery.getAppropriateMoment(gang, 90, {
            from: '09:00-5',
            to: '11:00-5'
        });

        var actual = robberyMoment.format(
            'Ограбление должно состоятся в %DD. Всем быть готовыми к %HH:%MM!'
        );

        expect(actual).to.be.equal(
            'Ограбление должно состоятся в СР. Всем быть готовыми к 19:00!'
        );
    });

});
