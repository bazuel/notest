import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';

export const icons = {
  e2e: 'm22 17.75c0-.414-.336-.75-.75-.75h-12.5c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75zm-19.806-.537 1.249 1.114c.13.116.293.173.456.173.184 0 .369-.075.504-.222l2.116-2.313c.119-.131.178-.296.178-.459 0-.375-.302-.682-.683-.682-.185 0-.369.074-.504.221l-1.661 1.815-.746-.665c-.131-.116-.292-.173-.454-.173-.379 0-.683.307-.683.682 0 .188.076.374.228.509zm19.806-3.463c0-.414-.336-.75-.75-.75h-12.5c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75zm-19.806-1.449 1.249 1.114c.13.116.293.173.456.173.184 0 .369-.074.504-.222l2.116-2.313c.119-.131.178-.295.178-.459 0-.375-.302-.682-.683-.682-.185 0-.369.074-.504.221l-1.661 1.815-.746-.665c-.131-.116-.292-.173-.454-.173-.379 0-.683.307-.683.683 0 .187.076.374.228.508zm19.806-2.551c0-.414-.336-.75-.75-.75h-12.5c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75zm-19.806-2.361 1.249 1.114c.13.116.293.173.456.173.184 0 .369-.074.504-.221l2.116-2.313c.119-.131.178-.296.178-.46 0-.374-.302-.682-.683-.682-.185 0-.369.074-.504.221l-1.661 1.815-.746-.664c-.131-.116-.292-.173-.454-.173-.379 0-.683.306-.683.682 0 .187.076.374.228.509zm19.806-1.639c0-.414-.336-.75-.75-.75h-12.5c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75z',
  player_play: 'M3 22v-20l18 10-18 10z',
  player_pause: 'M11 22h-4v-20h4v20zm6-20h-4v20h4v-20z',
  play: 'M3 22v-20l18 10-18 10z',
  settings:
    'M24 13.616v-3.232l-2.869-1.02c-.198-.687-.472-1.342-.811-1.955l1.308-2.751-2.285-2.285-2.751 1.307c-.613-.339-1.269-.613-1.955-.811l-1.021-2.869h-3.232l-1.021 2.869c-.686.198-1.342.471-1.955.811l-2.751-1.308-2.285 2.285 1.308 2.752c-.339.613-.614 1.268-.811 1.955l-2.869 1.02v3.232l2.869 1.02c.197.687.472 1.342.811 1.955l-1.308 2.751 2.285 2.286 2.751-1.308c.613.339 1.269.613 1.955.811l1.021 2.869h3.232l1.021-2.869c.687-.198 1.342-.472 1.955-.811l2.751 1.308 2.285-2.286-1.308-2.751c.339-.613.613-1.268.811-1.955l2.869-1.02zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z',
  rerun: 'M8 24l3-9h-9l14-15-3 9h9l-14 15z',
  test: 'M12 0c-2.996 2.995-7.486 4-11 4 0 8.583 5.067 16.097 11 20 5.932-3.903 11-11.417 11-20-3.515 0-8.006-1.005-11-4zm-.587 14.953l-3.452-3.362 1.237-1.239 2.215 2.123 4.381-4.475 1.238 1.238-5.619 5.715z',
  video:
    'M11.266 7l12.734-2.625-.008-.042-1.008-4.333-21.169 4.196c-1.054.209-1.815 1.134-1.815 2.207v14.597c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3v-14h-12.734zm8.844-5.243l2.396 1.604-2.994.595-2.398-1.605 2.996-.594zm-5.898 1.169l2.4 1.606-2.994.595-2.401-1.607 2.995-.594zm-5.904 1.171l2.403 1.608-2.993.595-2.406-1.61 2.996-.593zm-2.555 5.903l2.039-2h3.054l-2.039 2h-3.054zm4.247 10v-7l6 3.414-6 3.586zm4.827-10h-3.054l2.039-2h3.054l-2.039 2zm6.012 0h-3.054l2.039-2h3.054l-2.039 2z',
  funnel: 'M1 0h22l-9 14.094v9.906l-4-2v-7.906z',
  users:
    'M17.997 18h-.998c0-1.552.06-1.775-.88-1.993-1.438-.332-2.797-.645-3.293-1.729-.18-.396-.301-1.048.155-1.907 1.021-1.929 1.277-3.583.702-4.538-.672-1.115-2.707-1.12-3.385.017-.576.968-.316 2.613.713 4.512.465.856.348 1.51.168 1.908-.49 1.089-1.836 1.4-3.262 1.728-.982.227-.92.435-.92 2.002h-.995l-.002-.623c0-1.259.1-1.985 1.588-2.329 1.682-.389 3.344-.736 2.545-2.209-2.366-4.365-.676-6.839 1.865-6.839 2.492 0 4.227 2.383 1.867 6.839-.775 1.464.824 1.812 2.545 2.209 1.49.344 1.589 1.072 1.589 2.333l-.002.619zm4.81-2.214c-1.289-.298-2.489-.559-1.908-1.657 1.77-3.342.47-5.129-1.4-5.129-1.265 0-2.248.817-2.248 2.325 0 1.269.574 2.175.904 2.925h1.048c-.17-.75-1.466-2.562-.766-3.736.412-.692 1.704-.693 2.114-.012.38.631.181 1.812-.534 3.161-.388.733-.28 1.301-.121 1.648.305.666.977.987 1.737 1.208 1.507.441 1.368.042 1.368 1.48h.997l.002-.463c0-.945-.074-1.492-1.193-1.75zm-22.805 2.214h.997c0-1.438-.139-1.039 1.368-1.48.761-.221 1.433-.542 1.737-1.208.159-.348.267-.915-.121-1.648-.715-1.349-.914-2.53-.534-3.161.41-.682 1.702-.681 2.114.012.7 1.175-.596 2.986-.766 3.736h1.048c.33-.75.904-1.656.904-2.925.001-1.509-.982-2.326-2.247-2.326-1.87 0-3.17 1.787-1.4 5.129.581 1.099-.619 1.359-1.908 1.657-1.12.258-1.194.805-1.194 1.751l.002.463z',
  user:
    'M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm7.753 18.305c-.261-.586-.789-.991-1.871-1.241-2.293-.529-4.428-.993-3.393-2.945 3.145-5.942.833-9.119-2.489-9.119-3.388 0-5.644 3.299-2.489 9.119 1.066 1.964-1.148 2.427-3.393 2.945-1.084.25-1.608.658-1.867 1.246-1.405-1.723-2.251-3.919-2.251-6.31 0-5.514 4.486-10 10-10s10 4.486 10 10c0 2.389-.845 4.583-2.247 6.305z',
  crawl:
    'M4.908 2.081l-2.828 2.828 19.092 19.091 2.828-2.828-19.092-19.091zm2.121 6.363l-3.535-3.535 1.414-1.414 3.535 3.535-1.414 1.414zm1.731-5.845c1.232.376 2.197 1.341 2.572 2.573.377-1.232 1.342-2.197 2.573-2.573-1.231-.376-2.196-1.34-2.573-2.573-.375 1.232-1.34 2.197-2.572 2.573zm-5.348 6.954c-.498 1.635-1.777 2.914-3.412 3.413 1.635.499 2.914 1.777 3.412 3.411.499-1.634 1.778-2.913 3.412-3.411-1.634-.5-2.913-1.778-3.412-3.413zm9.553-3.165c.872.266 1.553.948 1.819 1.82.266-.872.948-1.554 1.819-1.82-.871-.266-1.553-.948-1.819-1.82-.266.871-.948 1.554-1.819 1.82zm4.426-6.388c-.303.994-1.082 1.772-2.075 2.076.995.304 1.772 1.082 2.077 2.077.303-.994 1.082-1.772 2.074-2.077-.992-.303-1.772-1.082-2.076-2.076z',
  key: 'M16 1c-4.418 0-8 3.582-8 8 0 .585.063 1.155.182 1.704l-8.182 7.296v5h6v-2h2v-2h2l3.066-2.556c.909.359 1.898.556 2.934.556 4.418 0 8-3.582 8-8s-3.582-8-8-8zm-6.362 17l3.244-2.703c.417.164 1.513.703 3.118.703 3.859 0 7-3.14 7-7s-3.141-7-7-7c-3.86 0-7 3.14-7 7 0 .853.139 1.398.283 2.062l-8.283 7.386v3.552h4v-2h2v-2h2.638zm.168-4l-.667-.745-7.139 6.402v1.343l7.806-7zm10.194-7c0-1.104-.896-2-2-2s-2 .896-2 2 .896 2 2 2 2-.896 2-2zm-1 0c0-.552-.448-1-1-1s-1 .448-1 1 .448 1 1 1 1-.448 1-1z',
  dashboard:
    'm21 4c0-.478-.379-1-1-1h-16c-.62 0-1 .519-1 1v16c0 .621.52 1 1 1h16c.478 0 1-.379 1-1zm-16.5.5h15v15h-15zm6.75 9.25v3.25c0 .53-.47 1-1 1h-3.25c-.53 0-1-.47-1-1v-3.25c0-.53.47-1 1-1h3.25c.53 0 1 .47 1 1zm-3.75.5v2.25h2.25v-2.25zm3.75-7.25v3.25c0 .53-.47 1-1 1h-3.25c-.53 0-1-.47-1-1v-3.25c0-.53.47-1 1-1h3.25c.53 0 1 .47 1 1zm6.75 0v3.25c0 .53-.47 1-1 1h-3.25c-.53 0-1-.47-1-1v-3.25c0-.53.47-1 1-1h3.25c.53 0 1 .47 1 1zm-10.5.5v2.25h2.25v-2.25zm6.75 0v2.25h2.25v-2.25z',
  logout:
    'M10 2v2h12v16h-12v2h14v-20h-14zm0 7.408l2.963 2.592-2.963 2.592v-1.592h-8v-2h8v-1.592zm-2-4.408v4h-8v6h8v4l8-7-8-7z',
  close:
    'M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z',
  comment:
    'M12 3c5.514 0 10 3.592 10 8.007 0 4.917-5.145 7.961-9.91 7.961-1.937 0-3.383-.397-4.394-.644-1 .613-1.595 1.037-4.272 1.82.535-1.373.723-2.748.602-4.265-.838-1-2.025-2.4-2.025-4.872-.001-4.415 4.485-8.007 9.999-8.007zm0-2c-6.338 0-12 4.226-12 10.007 0 2.05.738 4.063 2.047 5.625.055 1.83-1.023 4.456-1.993 6.368 2.602-.47 6.301-1.508 7.978-2.536 1.418.345 2.775.503 4.059.503 7.084 0 11.91-4.837 11.91-9.961-.001-5.811-5.702-10.006-12.001-10.006zm0 14h-5v-1h5v1zm5-3h-10v-1h10v1zm0-3h-10v-1h10v1z',
  doc_edit:
    'M 2 0 L 2 24 L 22 24 L 22 6 L 16 0 L 2 0 z M 4 2 L 15 2 L 15 7 L 20 7 L 20 22 L 4 22 L 4 2 z M 9.5996094 11.328125 C 9.0694508 11.328125 8.618467 11.42544 8.2460938 11.621094 C 7.8800319 11.816747 7.5826795 12.081511 7.3554688 12.416016 C 7.128258 12.75052 6.9642638 13.141734 6.8632812 13.589844 C 6.7622987 14.031643 6.7128906 14.499897 6.7128906 14.992188 L 8.6523438 14.992188 C 8.6523438 14.373669 8.7293855 13.939504 8.8808594 13.693359 C 9.0323332 13.447214 9.2457354 13.324219 9.5234375 13.324219 C 9.7190912 13.324219 9.9053117 13.385943 10.082031 13.505859 C 10.258751 13.619465 10.440016 13.761233 10.623047 13.931641 C 10.806078 14.102049 10.995753 14.28977 11.191406 14.498047 C 11.393371 14.700012 11.610228 14.889687 11.84375 15.066406 C 12.083584 15.236814 12.344893 15.382036 12.628906 15.501953 C 12.919231 15.615559 13.242264 15.673828 13.595703 15.673828 C 14.125862 15.673828 14.573391 15.57456 14.939453 15.378906 C 15.311826 15.183253 15.61068 14.918489 15.837891 14.583984 C 16.065101 14.243168 16.231049 13.851955 16.332031 13.410156 C 16.433014 12.962046 16.482422 12.49229 16.482422 12 L 14.541016 12 C 14.541016 12.618518 14.465927 13.054184 14.314453 13.306641 C 14.169291 13.552786 13.953935 13.675781 13.669922 13.675781 C 13.474268 13.675781 13.290001 13.619465 13.113281 13.505859 C 12.936562 13.385943 12.755297 13.240721 12.572266 13.070312 C 12.389235 12.893593 12.198059 12.703918 11.996094 12.501953 C 11.80044 12.299988 11.58163 12.113767 11.341797 11.943359 C 11.108275 11.76664 10.846966 11.621418 10.556641 11.507812 C 10.272627 11.387896 9.9530484 11.328125 9.5996094 11.328125 z',
  copy: 'M18 6v-6h-18v18h6v6h18v-18h-6zm-12 10h-4v-14h14v4h-10v10zm16 6h-14v-14h14v14z',
  download: 'M16 11h5l-9 10-9-10h5v-11h8v11zm3 8v3h-14v-3h-2v5h18v-5h-2z',
  http: 'M13.144 8.171c-.035-.066.342-.102.409-.102.074.009-.196.452-.409.102zm-2.152-3.072l.108-.031c.064.055-.072.095-.051.136.086.155.021.248.008.332-.014.085-.104.048-.149.093-.053.066.258.075.262.085.011.033-.375.089-.304.171.096.136.824-.195.708-.176.225-.113.029-.125-.097-.19-.043-.215-.079-.547-.213-.68l.088-.102c-.206-.299-.36.362-.36.362zm13.008 6.901c0 6.627-5.373 12-12 12-6.628 0-12-5.373-12-12s5.372-12 12-12c6.627 0 12 5.373 12 12zm-8.31-5.371c-.006-.146-.19-.284-.382-.031-.135.174-.111.439-.184.557-.104.175.567.339.567.174.025-.277.732-.063.87-.025.248.069.643-.226.211-.381-.355-.13-.542-.269-.574-.523 0 0 .188-.176.106-.166-.218.027-.614.786-.614.395zm6.296 5.371c0-1.035-.177-2.08-.357-2.632-.058-.174-.189-.312-.359-.378-.256-.1-1.337.597-1.5.254-.107-.229-.324.146-.572.008-.12-.066-.454-.515-.605-.46-.309.111.474.964.688 1.076.201-.152.852-.465.992-.038.268.804-.737 1.685-1.251 2.149-.768.694-.624-.449-1.147-.852-.275-.211-.272-.66-.55-.815-.124-.07-.693-.725-.688-.813l-.017.166c-.094.071-.294-.268-.315-.321 0 .295.48.765.639 1.001.271.405.416.995.748 1.326.178.178.858.914 1.035.898.193-.017.803-.458.911-.433.644.152-1.516 3.205-1.721 3.583-.169.317.138 1.101.113 1.476-.029.433-.37.573-.693.809-.346.253-.265.745-.556.925-.517.318-.889 1.353-1.623 1.348-.216-.001-1.14.36-1.261.007-.094-.256-.22-.45-.353-.703-.13-.248-.015-.505-.173-.724-.109-.152-.475-.497-.508-.677-.002-.155.117-.626.28-.708.229-.117.044-.458.016-.656-.048-.354-.267-.646-.53-.851-.389-.299-.188-.537-.097-.964 0-.204-.124-.472-.398-.392-.564.164-.393-.44-.804-.413-.296.021-.538.209-.813.292-.346.104-.7-.082-1.042-.125-1.407-.178-1.866-1.786-1.499-2.946.037-.19-.114-.542-.048-.689.158-.352.48-.747.762-1.014.158-.15.361-.112.547-.229.287-.181.291-.553.572-.781.4-.325.946-.318 1.468-.388.278-.037 1.336-.266 1.503-.06 0 .038.191.604-.019.572.433.023 1.05.749 1.461.579.211-.088.134-.736.567-.423.262.188 1.436.272 1.68.069.15-.124.234-.93.052-1.021.116.115-.611.124-.679.098-.12-.044-.232.114-.425.025.116.055-.646-.354-.218-.667-.179.131-.346-.037-.539.107-.133.108.062.18-.128.274-.302.153-.53-.525-.644-.602-.116-.076-1.014-.706-.77-.295l.789.785c-.039.025-.207-.286-.207-.059.053-.135.02.579-.104.347-.055-.089.09-.139.006-.268 0-.085-.228-.168-.272-.226-.125-.155-.457-.497-.637-.579-.05-.023-.764.087-.824.11-.07.098-.13.201-.179.311-.148.055-.287.126-.419.214l-.157.353c-.068.061-.765.291-.769.3.029-.075-.487-.171-.453-.321.038-.165.213-.68.168-.868-.048-.197 1.074.284 1.146-.235.029-.225.046-.487-.313-.525.068.008.695-.246.799-.36.146-.168.481-.442.724-.442.284 0 .223-.413.354-.615.131.053-.07.376.087.507-.01-.103.445.057.489.033.104-.054.684-.022.594-.294-.1-.277.051-.195.181-.253-.022.009.34-.619.402-.413-.043-.212-.421.074-.553.063-.305-.024-.176-.52-.061-.665.089-.115-.243-.256-.247-.036-.006.329-.312.627-.241 1.064.108.659-.735-.159-.809-.114-.28.17-.509-.214-.364-.444.148-.235.505-.224.652-.476.104-.178.225-.385.385-.52.535-.449.683-.09 1.216-.041.521.048.176.124.104.324-.069.19.286.258.409.099.07-.092.229-.323.298-.494.089-.222.901-.197.334-.536-.374-.223-2.004-.672-3.096-.672-.236 0-.401.263-.581.412-.356.295-1.268.874-1.775.698-.519-.179-1.63.66-1.808.666-.065.004.004-.634.358-.681-.153.023 1.247-.707 1.209-.859-.046-.18-2.799.822-2.676 1.023.059.092.299.092-.016.294-.18.109-.372.801-.541.801-.505.221-.537-.435-1.099.409l-.894.36c-1.328 1.411-2.247 3.198-2.58 5.183-.013.079.334.226.379.28.112.134.112.712.167.901.138.478.479.744.74 1.179.154.259.41.914.329 1.186.108-.178 1.07.815 1.246 1.022.414.487.733 1.077.061 1.559-.217.156.33 1.129.048 1.368l-.361.093c-.356.219-.195.756.021.982 1.818 1.901 4.38 3.087 7.22 3.087 5.517 0 9.989-4.472 9.989-9.989zm-11.507-6.357c.125-.055.293-.053.311-.22.015-.148.044-.046.08-.1.035-.053-.067-.138-.11-.146-.064-.014-.108.069-.149.104l-.072.019-.068.087.008.048-.087.106c-.085.084.002.139.087.102z',
  storage:
    'M12.008 0c-4.225 0-10.008 1.001-10.008 4.361v15.277c0 3.362 6.209 4.362 10.008 4.362 3.783 0 9.992-1.001 9.992-4.361v-15.278c0-3.361-5.965-4.361-9.992-4.361zm0 2c3.638 0 7.992.909 7.992 2.361 0 1.581-5.104 2.361-7.992 2.361-3.412.001-8.008-.905-8.008-2.361 0-1.584 4.812-2.361 8.008-2.361zm7.992 17.386c0 1.751-5.104 2.614-7.992 2.614-3.412 0-8.008-1.002-8.008-2.614v-2.04c2.117 1.342 5.17 1.78 8.008 1.78 2.829 0 5.876-.438 7.992-1.78v2.04zm0-4.873c0 1.75-5.104 2.614-7.992 2.614-3.412-.001-8.008-1.002-8.008-2.614v-2.364c2.116 1.341 5.17 1.78 8.008 1.78 2.839 0 5.881-.442 7.992-1.78v2.364zm-7.992-2.585c-3.426 0-8.008-1.006-8.008-2.614v-2.371c2.117 1.342 5.17 1.78 8.008 1.78 2.829 0 5.876-.438 7.992-1.78v2.372c0 1.753-5.131 2.613-7.992 2.613z',
  cookie:
    'M12.078 0c6.587.042 11.922 5.403 11.922 12 0 6.623-5.377 12-12 12s-12-5.377-12-12c3.887 1.087 7.388-2.393 6-6 4.003.707 6.786-2.722 6.078-6zm1.422 17c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm-6.837-3c1.104 0 2 .896 2 2s-.896 2-2 2-2-.896-2-2 .896-2 2-2zm11.337-3c1.104 0 2 .896 2 2s-.896 2-2 2-2-.896-2-2 .896-2 2-2zm-6-1c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm-9-3c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm13.5-2c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm-15-2c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm6-2c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm-3.5-1c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z',
  scroll:
    'M 8.6640625 0.47070312 L 7.828125 0.5234375 L 7.9765625 2.8710938 C 8.2432972 2.7500563 8.5168977 2.6607001 8.7988281 2.6035156 L 8.6640625 0.47070312 z M 5.8378906 1.4375 L 5.1816406 1.9570312 L 6.6699219 3.8320312 C 6.8535422 3.6211972 7.0634191 3.4373874 7.2910156 3.2695312 L 5.8378906 1.4375 z M 12.085938 2.78125 C 11.508027 2.7885449 10.926391 2.9639844 10.416016 3.3183594 L 5.4863281 6.7382812 C 4.1253281 7.6832813 3.7874219 9.5511099 4.7324219 10.912109 L 9.8632812 18.306641 C 11.028281 19.986641 12.895875 20.886719 14.796875 20.886719 C 18.060875 20.886719 20.792969 18.243859 20.792969 14.880859 C 20.792969 13.700859 20.444656 12.507844 19.722656 11.464844 L 14.591797 4.0703125 C 14.001172 3.2203125 13.049121 2.7690918 12.085938 2.78125 z M 4.046875 3.7988281 L 3.8105469 4.6035156 L 5.890625 5.21875 C 5.975473 4.94435 6.094768 4.6872823 6.234375 4.4433594 L 4.046875 3.7988281 z M 12.105469 4.2832031 C 12.586982 4.2774512 13.06375 4.5033594 13.359375 4.9277344 L 14.640625 6.7753906 L 12.175781 8.4882812 L 10.197266 5.2949219 L 11.271484 4.5488281 C 11.526484 4.3718281 11.816561 4.2866543 12.105469 4.2832031 z M 7.5488281 7.1328125 L 9.6992188 10.205078 L 7.2480469 11.90625 L 5.9648438 10.056641 C 5.4908437 9.3786411 5.6617969 8.4427031 6.3417969 7.9707031 L 7.5488281 7.1328125 z M 15.496094 8.0078125 L 18.490234 12.320312 C 19.904234 14.359312 19.397375 17.168031 17.359375 18.582031 C 15.320375 19.997031 12.50775 19.490172 11.09375 17.451172 L 8.1015625 13.138672 L 15.496094 8.0078125 z M 14.0625 10.027344 C 13.97765 10.301744 13.86031 10.558811 13.720703 10.802734 L 15.90625 11.447266 L 16.144531 10.642578 L 14.0625 10.027344 z M 13.285156 11.414062 C 13.101535 11.624897 12.889706 11.808706 12.662109 11.976562 L 14.117188 13.808594 L 14.773438 13.289062 L 13.285156 11.414062 z M 11.978516 12.375 C 11.711782 12.496037 11.43818 12.585393 11.15625 12.642578 L 11.289062 14.775391 L 12.125 14.722656 L 11.978516 12.375 z',
  mouse:
    'M13.623 5.431l-4.93 3.42c-1.361.945-1.698 2.814-.754 4.175l5.131 7.394c1.165 1.68 3.034 2.58 4.935 2.58 3.264 0 5.995-2.643 5.995-6.006 0-1.18-.347-2.373-1.071-3.416l-5.131-7.394c-.945-1.36-2.814-1.698-4.175-.753zm.855 1.232c.68-.472 1.615-.302 2.088.377l1.282 1.849-3.081 2.138-2.137-3.082 1.848-1.282zm-4.93 3.42l1.85-1.283 2.137 3.081-3.08 2.138-1.283-1.849c-.472-.678-.303-1.615.376-2.087zm11.018 10.613c-2.039 1.415-4.849.908-6.264-1.131l-2.992-4.313 7.394-5.131 2.993 4.313c1.414 2.039.907 4.848-1.131 6.262zm-14.957-11.365c.353-1.73-.451-2.938-1.033-4.231-1.025-2.284 1.564-3.706 3.041-1.643l2.067 2.879 1.191-.836-2.073-2.892c-.802-1.119-1.896-1.608-2.941-1.608-2.114 0-3.592 2.2-2.665 4.565.478 1.218 1.282 2.019.985 3.474-.247 1.207-1.803 2.077-3.367 1.023l-.814 1.209c2.463 1.658 5.165.238 5.609-1.94z',
  keyboard:
    'M22 7v10h-20v-10h20zm2-2h-24v14h24v-14zm-18 3h-3v2h3v-2zm3 0h-2v2h2v-2zm3 0h-2v2h2v-2zm3 0h-2v2h2v-2zm3 0h-2v2h2v-2zm3 0h-2v2h2v-2zm-4 6h-10v2h10v-2zm4-3h-4v2h4v-2zm-14 0h-4v2h4v-2zm3 0h-2v2h2v-2zm3 0h-2v2h2v-2zm3 0h-2v2h2v-2z',
  dom: 'M15 2v5h5v15h-16v-20h11zm1-2h-14v24h20v-18l-6-6z',
  page: 'M22 24h-20v-24h10.189c3.162 0 9.811 7.223 9.811 9.614v14.386zm-10.638-22h-7.362v20h16v-11.543c0-4.107-6-2.457-6-2.457s1.517-6-2.638-6zm.638 12h-5l1-5 1.395 1.744c.76-.467 1.648-.744 2.605-.744 2.76 0 5 2.24 5 5s-2.24 5-5 5c-2.482 0-4.544-1.812-4.934-4.184l1.967-.367c.217 1.443 1.464 2.551 2.967 2.551 1.656 0 3-1.345 3-3s-1.344-3-3-3c-.483 0-.935.123-1.339.326l1.339 1.674z',
  window:
    'm20 19.998h-15.25c-.414 0-.75.336-.75.75s.336.75.75.75h15.75c.53 0 1-.469 1-1v-15.75c0-.414-.336-.75-.75-.75s-.75.336-.75.75zm-1-17c0-.478-.379-1-1-1h-15c-.62 0-1 .519-1 1v15c0 .621.52 1 1 1h15c.478 0 1-.379 1-1zm-1.5 4v10.5h-14v-10.5z',
  warning:
    'M12 5.177l8.631 15.823h-17.262l8.631-15.823zm0-4.177l-12 22h24l-12-22zm-1 9h2v6h-2v-6zm1 9.75c-.689 0-1.25-.56-1.25-1.25s.561-1.25 1.25-1.25 1.25.56 1.25 1.25-.561 1.25-1.25 1.25z',
  error: 'M16.142 2l5.858 5.858v8.284l-5.858 5.858h-8.284l-5.858-5.858v-8.284l5.858-5.858h8.284zm.829-2h-9.942l-7.029 7.029v9.941l7.029 7.03h9.941l7.03-7.029v-9.942l-7.029-7.029zm-8.482 16.992l3.518-3.568 3.554 3.521 1.431-1.43-3.566-3.523 3.535-3.568-1.431-1.432-3.539 3.583-3.581-3.457-1.418 1.418 3.585 3.473-3.507 3.566 1.419 1.417z',
  success: 'M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z',
  info: 'M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.033 16.01c.564-1.789 1.632-3.932 1.821-4.474.273-.787-.211-1.136-1.74.209l-.34-.64c1.744-1.897 5.335-2.326 4.113.613-.763 1.835-1.309 3.074-1.621 4.03-.455 1.393.694.828 1.819-.211.153.25.203.331.356.619-2.498 2.378-5.271 2.588-4.408-.146zm4.742-8.169c-.532.453-1.32.443-1.761-.022-.441-.465-.367-1.208.164-1.661.532-.453 1.32-.442 1.761.022.439.466.367 1.209-.164 1.661z',
  frontend: 'M22.5 7c.828 0 1.5.672 1.5 1.5v14c0 .826-.671 1.5-1.5 1.5h-7c-.829 0-1.5-.675-1.5-1.5v-14c0-.827.673-1.5 1.5-1.5h7zm-8.907 17h-9.593l2.599-3h6.401v1.804c0 .579.336 1.09.593 1.196zm5.407-1c-.553 0-1-.448-1-1s.447-1 1-1c.552 0 .999.448.999 1s-.447 1-.999 1zm4-3v-10.024h-8v10.024h8zm-1-14h-2v-4h-18v15h11v2h-13v-19h22v6zm-2.5 3c.275 0 .5-.224.5-.5s-.225-.5-.5-.5h-1c-.276 0-.5.224-.5.5s.224.5.5.5h1z',
  mousemove:
    'M 9.1015625 3.6464844 C 7.4446573 3.6431759 6.0970583 4.9817671 6.09375 6.6386719 L 6.0742188 15.638672 C 6.0689088 17.683079 7.0871536 19.490795 8.6464844 20.578125 C 11.323842 22.445063 15.076436 21.838642 17 19.080078 C 17.674934 18.112161 18.071833 16.934525 18.076172 15.666016 L 18.095703 6.6660156 C 18.098403 5.0099307 16.758468 3.6634649 15.101562 3.6601562 L 9.1015625 3.6464844 z M 9.0976562 5.1464844 L 11.349609 5.1523438 L 11.339844 8.9023438 L 7.5917969 8.8945312 L 7.5957031 6.6425781 C 7.5946209 5.815314 8.2698998 5.1447059 9.0976562 5.1464844 z M 12.849609 5.15625 L 15.097656 5.1601562 C 15.925412 5.1619363 16.59609 5.8365543 16.595703 6.6640625 L 16.587891 8.9140625 L 12.839844 8.90625 L 12.849609 5.15625 z M 3.2636719 7.2460938 L 3.2636719 15.849609 L 4.9042969 15.849609 L 4.9042969 7.2460938 L 3.2636719 7.2460938 z M 19.265625 7.4726562 L 19.265625 16.076172 L 20.90625 16.076172 L 20.90625 7.4726562 L 19.265625 7.4726562 z M 0.453125 8.8867188 L 0.453125 14.546875 L 2.09375 14.546875 L 2.09375 8.8867188 L 0.453125 8.8867188 z M 22.076172 8.8867188 L 22.076172 14.546875 L 23.716797 14.546875 L 23.716797 8.8867188 L 22.076172 8.8867188 z M 7.5859375 10.394531 L 16.585938 10.414062 L 16.574219 15.664062 C 16.567819 18.145369 14.544938 20.160129 12.064453 20.154297 C 9.5825766 20.148713 7.5678149 18.123883 7.5742188 15.642578 L 7.5859375 10.394531 z '
};

export type BOIcon = keyof typeof icons | string;

@Component({
  selector: 'nt-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {
  icons = icons;

  @Input() name!: BOIcon;

  @HostBinding('class') @Input('class') classList = '';

  @Output()
  click = new EventEmitter();

  ngOnInit() {
    if (
      !this.classList.includes('icon-') &&
      !this.classList.includes('w-') &&
      !this.classList.includes('h-')
    ) {
      this.classList += ' w-4 h-4';
    }
  }
}
