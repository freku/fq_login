local CFG = exports['fq_essentials']:getCFG()
local mCFG = CFG.menu
local gCFG = CFG.gangs

local sp = {}
-- local onAuthMSG = 'Zostales poprawnie zalogowany!'
local onAuthMSG = 'Dobrej zabawy!'
local isOpen = false
local isEnglish

local isMenuScriptLoaded = false

local function init()
    local playerSpawnPoint = {
        x = mCFG.player.position.x, y = mCFG.player.position.y, z = mCFG.player.position.z,
        heading = mCFG.player.heading,
        model = 'mp_m_freemode_01',
        skipFade = true
    }
    
	sp.player = exports.spawnmanager:addSpawnPoint(playerSpawnPoint)
end
init()

AddEventHandler('onClientResourceStart', function (resourceName)
    if(GetCurrentResourceName() == 'fq_login') then
        isMenuScriptLoaded = true

        TriggerEvent('fq:showLoginPanel')
    end
end)

RegisterNetEvent('fq:showLoadingScreen')
AddEventHandler('fq:showLoadingScreen', function(_msg)
    SendNUIMessage({
		type = 'ON_SHOW_LS'
	})
end)

RegisterNetEvent('fq:getResponse')
AddEventHandler('fq:getResponse', function(_msg)
    SendNUIMessage({
		type = 'ON_RESPONSE',
		msg = _msg
    })

    if _msg == onAuthMSG then
        Wait(200)
        TriggerEvent('fq:hideLoginPanel')
        
        local time = GetGameTimer()
        while not isMenuScriptLoaded and (GetGameTimer() - time) < 5000 do
            Wait(0)
        end

        if not isMenuScriptLoaded then
            TriggerServerEvent('fq:kickMe', 'Skrypty nie zostaly zaladowane poprawnie')
        end

        TriggerEvent('fq:showMenu')
    end
end)

RegisterNetEvent('fq:stateLoginPanel')
AddEventHandler('fq:stateLoginPanel', function(_state)
    SendNUIMessage({
		type = 'ON_STATE',
		state = _state
    })
end)

RegisterNetEvent('fq:showLoginPanel')
AddEventHandler('fq:showLoginPanel', function()
	exports.spawnmanager:spawnPlayer(sp.player, function()
		exports.spawnmanager:freezePlayer(PlayerId(), true)
        TriggerEvent('hideChat', true)
        TriggerEvent('fq:stateLoginPanel', true)
        SetNuiFocus(true, true)
	end)

	local pos = mCFG.cam.position
	local cam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", pos.x, pos.y, pos.z, 0, 0, mCFG.player.heading, 50.0)
	
	SetCamActive(cam, true)
	RenderScriptCams(true, false, 0, true, false)
	
	SetCamAffectsAiming(cam, false)
	isOpen = true
end)

RegisterNetEvent('fq:hideLoginPanel')
AddEventHandler('fq:hideLoginPanel', function()
    exports.spawnmanager:freezePlayer(PlayerId(), false)
	RenderScriptCams(false, true, 1000, true, false)

    TriggerEvent('hideChat', false)
    TriggerEvent('fq:stateLoginPanel', false)
    isOpen = false
end)

RegisterNUICallback('getData', function(data, cb)
    if data.action == 'AUTH' then
        if data._login and data._password then
            TriggerServerEvent('fq:Auth', data)
            TriggerEvent('fq:showLoadingScreen')
        end
    elseif data.action == 'CHANGE_PASSWORD' then
        if data._email then
            TriggerServerEvent('fq:changePassword', data)
            TriggerEvent('fq:showLoadingScreen')
        end
    elseif data.action == 'SEND_AUTH_DATA' then
        if data._login and data._password and data._email then
            TriggerServerEvent('fq:registerAccount', data)
            TriggerEvent('fq:showLoadingScreen')
        end
    elseif data.action == 'SET_LANG' then
        if data.lang == 'eng' then
            isEnglish = true
        else
            isEnglish = nil
        end
    end
end)

Citizen.CreateThread(function()
	while true do
		Citizen.Wait(1)
		if isOpen then
			HideHudAndRadarThisFrame()
		end
	end
end)

function getLang()
    return isEnglish and 'eng' or 'pl'
end
exports('getLang', getLang)