
<script>
    const imgUrl = 'https://notest.io/assets/img/logo.png';
</script>

<div class="nt-logo-container">
    <img class="nt-logo-url" src="{imgUrl}" alt="logo">
    <a class="font-logo" href="https://www.notest.io" target="_blank">
        <span class="nt-title-NO">NO</span><span class="nt-title-TEST">TEST</span>
    </a>
</div>

<style lang="scss">

    .font-logo {
        font-family: 'Anton', sans-serif !important;
    }
    .nt-logo-container {
        @apply flex items-center;
    }

    .nt-logo-url {
        @apply w-14 h-14 mr-2;
    }

    .nt-title-NO {
        @apply text-xl text-bos;
    }

    .nt-title-TEST {
        @apply text-xl text-bop;
    }
</style>