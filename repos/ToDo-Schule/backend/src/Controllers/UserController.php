<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Lib\Request;
use App\Lib\Response;
use App\Lib\Validator;
use App\Models\User;

/**
 * UserController
 * -----------------------------------------------------------------------------
 * Eigenes Profil abrufen und aktualisieren.
 */
final class UserController
{
    public static function me(Request $req): void
    {
        Response::json(['user' => $req->user]);
    }

    public static function updateMe(Request $req): void
    {
        $data = Validator::make($req->body, [
            'name'      => 'nullable|string|max:120',
            'avatarUrl' => 'nullable|string|max:512',
        ]);

        $update = [];
        if (array_key_exists('name', $data)) {
            $update['name'] = $data['name'];
        }
        if (array_key_exists('avatarUrl', $data)) {
            $update['avatar_url'] = $data['avatarUrl'];
        }

        $user = User::update($req->userId(), $update);
        Response::json(['user' => $user]);
    }
}
