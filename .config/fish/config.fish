if status is-interactive
    # Mostrar mensaje de bienvenida
    if type -q figlet; and type -q lolcat
        figlet "cabreradev" | lolcat
    end
    
    # Configuración moderna de Fish
    # Tema de colores modernos - Inspirado en Warp
    set -U fish_color_normal normal
    set -U fish_color_command 569CD6
    set -U fish_color_keyword 569CD6
    set -U fish_color_quote 6A9955
    set -U fish_color_redirection D7BA7D
    set -U fish_color_end F8F8F2
    set -U fish_color_error FF6B6B
    set -U fish_color_operator D7BA7D
    set -U fish_color_escape D7BA7D
    set -U fish_color_param 9CDCFE
    set -U fish_color_comment 608B4E
    set -U fish_color_selection --background=4E4E4E
    set -U fish_color_search_match --background=4E4E4E
    set -U fish_color_history_current --bold
    set -U fish_pager_color_prefix 9CDCFE
    set -U fish_pager_color_progress 4E4E4E
    set -U fish_pager_color_completion F8F8F2 4E4E4E
    set -U fish_pager_color_description 608B4E
end
