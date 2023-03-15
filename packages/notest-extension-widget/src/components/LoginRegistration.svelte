<script lang="ts">
    import {tokenService} from "../shared/services/token.service.ts";
    import {createEventDispatcher, onMount} from "svelte";
    import {http} from "../shared/services/http.service.ts";
    import {NTUser} from "@notest/common"
    import {appStore, updateLogged} from "../stores/settings.store";

    export const dispatcher = createEventDispatcher();

    let logged = false;
    let logging = false;
    let failLogin = false;
    let user: Partial<NTUser> = {};

    onMount(async () => {
        logged = $appStore.logged;
    })

    const doLogin = async () => {
        const res = await http.post('/user/login', user).catch(() => user.password = '');
        if (res.token) {
            updateLogged(true)
            tokenService.token = res.token
            dispatcher('login')
            logged = true
            logging = false;
            failLogin = false;
            window.postMessage({type: 'login', token: res.token}, '*');
        } else {
            user.password = '';
            failLogin = true;
        }
    };
    const doLogout = () => {
        updateLogged(false)
        tokenService.logout()
        window.postMessage({type: 'logout'}, '*');
        logged = false;
    }
    let goToRegistration = () => {
        window.open(import.meta.env.VITE_APP_URL + '/auth/registration')
    };
</script>

<div class="nt-login-container nt-center">
    {#if !logged}
        {#if logging}
            <div class="nt-slide nt-logging-container">
                <h3 class="nt-h3">Login</h3>
                {#if failLogin}
                    <p class="nt-invalid-login-container">Invalid Username or Password. Try Again</p>
                {/if}
                <input class="nt-input" placeholder="Email" type="email" bind:value={user.email}/>
                <input class="nt-input nt-login-password-input-container" placeholder="Password" type="password"
                       bind:value={user.password}
                       on:keydown={(e) => e.key === "Enter" ? doLogin():''}/>
                <div class="nt-credential-recovery-container">
                    <a class="nt-a" href={import.meta.env.VITE_APP_URL + '/auth/login?forgot-password=1'}
                       target="_blank"
                       rel="noreferrer">
                        Forgot Password
                    </a>
                    <a class="nt-a" href={import.meta.env.VITE_APP_URL + '/auth/registration'} target="_blank"
                       rel="noreferrer">
                        Register
                    </a>
                </div>
                <button class="nt-button nt-login-button-container" on:click={doLogin}>Login</button>
            </div>
        {:else }
            <div class="text-center">
                Already have an account?
                <div class="nt-login-button-container nt-center">
                    <button class="nt-button" on:click={() => logging = true}>Login</button>
                    <button class="nt-button nt-stylized nt-register-button-container" on:click={goToRegistration}>
                        Register
                    </button>
                </div>
            </div>
        {/if}
    {:else}
        <div class="nt-logged-panel-container">
            <h3 class="nt-h3">Logged</h3>
            <button class="nt-logout-button-container nt-button" on:click={doLogout}>
                Logout
            </button>
        </div>
    {/if}
</div>

<style lang="scss">
    @import "/app.scss";
    @keyframes up {
        0% {
            height: 0;
        }
        100% {
            height: 200px;
        }
    }

    .nt-login-container {
        @apply mt-auto p-5;
    }

    .nt-logging-container {
        @apply overflow-hidden w-4/5;
    }

    .nt-logged-panel-container {
        @apply overflow-hidden flex items-center;
    }


    .nt-invalid-login-container {
        @apply text-red-800;
    }


    .nt-login-password-input-container {
        @apply mt-2;
    }

    .nt-credential-recovery-container {
        @apply flex justify-between py-2;
    }

    .nt-register-button-container {
        @apply ml-10;
    }

    .nt-slide {
        animation: up 0.5s ease-in-out;
    }

    .nt-login-button-container {
        @apply mt-2 mb-5;
    }

    .nt-logout-button-container {
        @apply mx-5;
    }

    .nt-stylized {
        @apply bg-white border-2 border-bop text-bop;
    }
</style>