<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Lib\Emitter;
use App\Lib\HttpException;
use App\Lib\Request;
use App\Lib\Response;
use App\Lib\Validator;
use App\Models\Team;

/**
 * TeamController
 * -----------------------------------------------------------------------------
 * Teams erstellen, Details abrufen und Mitglieder per E-Mail einladen.
 */
final class TeamController
{
    public static function store(Request $req): void
    {
        $data = Validator::make($req->body, ['name' => 'required|string|min:2|max:160']);
        $team = Team::create($data['name'], $req->userId());
        Response::json(['team' => $team], 201);
    }

    public static function show(Request $req): void
    {
        $teamId = (int) $req->param('id');
        $team = Team::find($teamId);
        if ($team === null) {
            throw HttpException::notFound('Team nicht gefunden', 'team_not_found');
        }
        if (!Team::isMember($teamId, $req->userId())) {
            throw HttpException::forbidden('Kein Zugriff auf dieses Team', 'team_forbidden');
        }
        Response::json(['team' => $team]);
    }

    public static function invite(Request $req): void
    {
        $teamId = (int) $req->param('id');
        $team = Team::find($teamId);
        if ($team === null) {
            throw HttpException::notFound('Team nicht gefunden', 'team_not_found');
        }
        if (!Team::isMember($teamId, $req->userId())) {
            throw HttpException::forbidden('Nur Mitglieder dürfen einladen', 'team_forbidden');
        }

        $data = Validator::make($req->body, [
            'email'     => 'required|email',
            'expiresAt' => 'nullable|date',
        ]);
        $expiresAt = !empty($data['expiresAt']) ? date('Y-m-d H:i:s', strtotime($data['expiresAt'])) : null;

        $invite = Team::createInvite($teamId, $data['email'], $req->userId(), $expiresAt);

        // Falls der Eingeladene bereits existiert und sofort Mitglied wurde,
        // ihm per Echtzeit Bescheid geben + aktualisierte Mitgliederliste senden.
        if ($invite['matched']) {
            Emitter::emit(Emitter::team($teamId), 'team:member_added', [
                'teamId'  => $teamId,
                'members' => Team::members($teamId),
            ]);
        }

        Response::json([
            'invite' => [
                'email'   => $invite['email'],
                'token'   => $invite['token'],
                'teamId'  => $teamId,
                'matched' => $invite['matched'],
            ],
        ], 201);
    }
}
