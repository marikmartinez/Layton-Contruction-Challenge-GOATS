/*
 * Interface translations.
 *
 * Languages: English plus the three most common non-English home languages of
 * US construction workers in CPWR data (Spanish, Portuguese, Polish).
 *
 * I18N maps the English text exactly as it appears in the code to
 * [Spanish, Portuguese (Brazil), Polish]. Anything missing falls back to
 * English. `{name}` placeholders are filled in by t(text, { name }).
 *
 * Stored values (dataset option values, record IDs, job names, text people
 * type) are never translated, only what's displayed.
 *
 * NOTE: these were machine-drafted. Have a native speaker review them,
 * especially the safety and crisis-support wording, before field use.
 */

/* eslint-disable no-unused-vars */

const LANGUAGES = [
  { code: "en", htmlLang: "en", label: "English" },
  { code: "es", htmlLang: "es", label: "Español" },
  { code: "pt", htmlLang: "pt-BR", label: "Português" },
  { code: "pl", htmlLang: "pl", label: "Polski" },
];

const I18N = {
  /* ---- App chrome & menu ---- */
  "Safety Forms": ["Formularios de seguridad", "Formulários de segurança", "Formularze BHP"],
  "Layton Safety Forms": ["Formularios de seguridad Layton", "Formulários de segurança Layton", "Formularze BHP Layton"],
  "Layton Safety": ["Seguridad Layton", "Segurança Layton", "BHP Layton"],
  "Back to forms": ["Volver a los formularios", "Voltar aos formulários", "Wróć do formularzy"],
  "Open menu": ["Abrir menú", "Abrir menu", "Otwórz menu"],
  "Close menu": ["Cerrar menú", "Fechar menu", "Zamknij menu"],
  "Main menu": ["Menú principal", "Menu principal", "Menu główne"],
  "All forms": ["Todos los formularios", "Todos os formulários", "Wszystkie formularze"],
  "My profile & reports": ["Mi perfil y reportes", "Meu perfil e relatos", "Mój profil i zgłoszenia"],
  "Report": ["Reportar", "Relatar", "Zgłoś"],
  "Support": ["Apoyo", "Apoio", "Wsparcie"],
  "Language": ["Idioma", "Idioma", "Język"],
  "Language set to {lang}.": ["Idioma cambiado a {lang}.", "Idioma alterado para {lang}.", "Zmieniono język na {lang}."],
  "Mental health & substance use": ["Salud mental y uso de sustancias", "Saúde mental e uso de substâncias", "Zdrowie psychiczne i uzależnienia"],
  "Need to talk now?": ["¿Necesitas hablar ahora?", "Precisa conversar agora?", "Potrzebujesz porozmawiać?"],
  "Call or text 988, free and confidential, 24/7": [
    "Llama o envía un mensaje al 988, gratis y confidencial, 24/7",
    "Ligue ou mande mensagem para o 988, grátis e confidencial, 24h",
    "Zadzwoń lub napisz SMS na 988, bezpłatnie i poufnie, 24/7",
  ],
  "Leave this form? What you've entered will be lost.": [
    "¿Salir de este formulario? Se perderá lo que escribiste.",
    "Sair deste formulário? O que você preencheu será perdido.",
    "Opuścić formularz? Wprowadzone dane zostaną utracone.",
  ],

  /* ---- Picker ---- */
  "What are you reporting?": ["¿Qué vas a reportar?", "O que você vai relatar?", "Co chcesz zgłosić?"],
  "Pick a form. You can fill it in by voice, photo, typing, or any mix.": [
    "Elige un formulario. Puedes llenarlo con voz, foto, escribiendo o combinándolos.",
    "Escolha um formulário. Você pode preencher por voz, foto, digitando ou combinando.",
    "Wybierz formularz. Możesz go wypełnić głosem, zdjęciem, pisząc lub łącząc te sposoby.",
  ],

  /* ---- Forms: titles, blurbs, prompts ---- */
  "Good Catch": ["Buena detección", "Boa observação", "Wychwycone zagrożenie"],
  "A hazard you spotted and controlled before anyone got hurt.": [
    "Un peligro que detectaste y controlaste antes de que alguien se lastimara.",
    "Um perigo que você viu e controlou antes que alguém se machucasse.",
    "Zagrożenie, które zauważyłeś i opanowałeś, zanim ktoś ucierpiał.",
  ],
  "Describe what you saw, where it was, and what you did about it right away.": [
    "Describe lo que viste, dónde estaba y qué hiciste de inmediato.",
    "Descreva o que você viu, onde estava e o que fez na hora.",
    "Opisz, co zauważyłeś, gdzie to było i co od razu zrobiłeś.",
  ],
  "Photograph the hazard and, if you can, the fix in place.": [
    "Toma una foto del peligro y, si puedes, de la solución ya aplicada.",
    "Fotografe o perigo e, se puder, a correção já feita.",
    "Zrób zdjęcie zagrożenia i, jeśli możesz, wprowadzonej poprawki.",
  ],
  "Safety Issue": ["Problema de seguridad", "Problema de segurança", "Problem BHP"],
  "An unsafe condition or practice that needs to be corrected.": [
    "Una condición o práctica insegura que hay que corregir.",
    "Uma condição ou prática insegura que precisa ser corrigida.",
    "Niebezpieczny stan lub zachowanie, które trzeba poprawić.",
  ],
  "Describe the unsafe condition, how serious it is, and who or what caused it.": [
    "Describe la condición insegura, qué tan grave es y quién o qué la causó.",
    "Descreva a condição insegura, a gravidade e quem ou o que causou.",
    "Opisz niebezpieczny stan, jak jest poważny i kto lub co go spowodował.",
  ],
  "Photograph the condition so the responsible crew can find it.": [
    "Toma una foto de la condición para que la cuadrilla responsable la encuentre.",
    "Fotografe a condição para que a equipe responsável a encontre.",
    "Zrób zdjęcie, żeby odpowiedzialna brygada mogła to znaleźć.",
  ],
  "Injury / Incident": ["Lesión / Incidente", "Lesão / Incidente", "Uraz / Zdarzenie"],
  "Someone was hurt, from first aid through lost time.": [
    "Alguien se lastimó, desde primeros auxilios hasta tiempo perdido.",
    "Alguém se machucou, de primeiros socorros até afastamento.",
    "Ktoś został ranny – od pierwszej pomocy po absencję w pracy.",
  ],
  "Say what the worker was doing, what happened, which body part was hurt, and what treatment was given.": [
    "Di qué hacía el trabajador, qué pasó, qué parte del cuerpo se lastimó y qué tratamiento recibió.",
    "Diga o que o trabalhador fazia, o que aconteceu, qual parte do corpo foi atingida e qual atendimento recebeu.",
    "Powiedz, co robił pracownik, co się stało, która część ciała ucierpiała i jakiej pomocy udzielono.",
  ],
  "Photograph the area and equipment involved. Don't photograph the injury itself.": [
    "Toma fotos del área y del equipo involucrado. No fotografíes la lesión.",
    "Fotografe a área e o equipamento envolvidos. Não fotografe a lesão.",
    "Sfotografuj miejsce i sprzęt. Nie fotografuj samego urazu.",
  ],
  "Daily Journal": ["Diario de obra", "Diário de obra", "Dziennik budowy"],
  "Today's crew size, hours, main activity and weather.": [
    "Personal de hoy, horas, actividad principal y clima.",
    "Equipe de hoje, horas, atividade principal e clima.",
    "Dzisiejsza obsada, godziny, główne prace i pogoda.",
  ],
  "Say how many people were on site, the hours worked, the main activity, and the weather.": [
    "Di cuántas personas hubo en la obra, las horas trabajadas, la actividad principal y el clima.",
    "Diga quantas pessoas estavam na obra, as horas trabalhadas, a atividade principal e o clima.",
    "Powiedz, ile osób było na budowie, ile godzin przepracowano, jakie były główne prace i pogoda.",
  ],
  "Photograph the sign-in sheet or timecards.": [
    "Toma una foto de la hoja de asistencia o las tarjetas de tiempo.",
    "Fotografe a lista de presença ou os cartões de ponto.",
    "Zrób zdjęcie listy obecności lub kart czasu pracy.",
  ],
  "e.g. On level 3 by the east stair I found a frayed extension cord before anyone plugged in. Pulled it from service and told the foreman. No follow-up needed.": [
    "ej. En el nivel 3, junto a la escalera este, encontré una extensión deshilachada antes de que alguien la conectara. La retiré y avisé al capataz. No necesita seguimiento.",
    "ex. No 3º andar, perto da escada leste, achei uma extensão desfiada antes de alguém ligar. Tirei de uso e avisei o encarregado. Não precisa de acompanhamento.",
    "np. Na 3. poziomie przy wschodniej klatce znalazłem przetarty przedłużacz, zanim ktoś go podłączył. Wycofałem go i powiedziałem brygadziście. Nie wymaga dalszych działań.",
  ],
  "e.g. Floor opening on level 2 near the elevator core has no cover or guardrail. High severity, the framing crew needs to guard it by Friday.": [
    "ej. Abertura en el piso del nivel 2 cerca del núcleo del elevador sin tapa ni barandal. Gravedad alta, la cuadrilla de estructura debe protegerla antes del viernes.",
    "ex. Abertura no piso do 2º andar perto do poço do elevador sem tampa nem guarda-corpo. Gravidade alta, a equipe de estrutura precisa proteger até sexta.",
    "np. Otwór w stropie na 2. poziomie przy szybie windy nie ma pokrywy ani barierki. Wysokie ryzyko, brygada ciesielska musi go zabezpieczyć do piątku.",
  ],
  "e.g. This morning a laborer carrying block slipped on debris in the stairwell and twisted their ankle. Ice and first aid on site, back to work the same day.": [
    "ej. Esta mañana un ayudante que cargaba bloques se resbaló con escombros en la escalera y se torció el tobillo. Hielo y primeros auxilios en la obra, volvió a trabajar el mismo día.",
    "ex. Hoje de manhã um servente carregando blocos escorregou em entulho na escada e torceu o tornozelo. Gelo e primeiros socorros na obra, voltou ao trabalho no mesmo dia.",
    "np. Rano robotnik niosący bloczki poślizgnął się na gruzie na klatce schodowej i skręcił kostkę. Lód i pierwsza pomoc na miejscu, wrócił do pracy tego samego dnia.",
  ],
  "e.g. 42 on site today, 336 regular hours and about 34 overtime. Mostly structural framing. Snowed all morning.": [
    "ej. 42 en la obra hoy, 336 horas normales y unas 34 extra. Más que nada estructura. Nevó toda la mañana.",
    "ex. 42 na obra hoje, 336 horas normais e cerca de 34 extras. Principalmente estrutura. Nevou a manhã toda.",
    "np. Dziś 42 osoby na budowie, 336 godzin podstawowych i ok. 34 nadgodziny. Głównie konstrukcja. Cały ranek padał śnieg.",
  ],
  "on site": ["en la obra", "na obra", "na budowie"],
  "hrs": ["h", "h", "godz."],

  /* ---- Field labels, hints, placeholders ---- */
  "Job": ["Obra", "Obra", "Budowa"],
  "Report date": ["Fecha del reporte", "Data do relato", "Data zgłoszenia"],
  "Hazard category": ["Categoría de peligro", "Categoria de perigo", "Kategoria zagrożenia"],
  "What did you catch?": ["¿Qué detectaste?", "O que você observou?", "Co wychwyciłeś?"],
  "Potential severity": ["Gravedad potencial", "Gravidade potencial", "Potencjalna waga"],
  "How bad could it have been if nobody caught it?": [
    "¿Qué tan grave pudo haber sido si nadie lo detectaba?",
    "Quão grave poderia ter sido se ninguém tivesse visto?",
    "Jak poważnie mogło się skończyć, gdyby nikt tego nie zauważył?",
  ],
  "Immediate action taken": ["Acción inmediata tomada", "Ação imediata tomada", "Podjęte natychmiastowe działanie"],
  "Follow-up required?": ["¿Requiere seguimiento?", "Precisa de acompanhamento?", "Czy potrzebne są dalsze działania?"],
  "Follow-up status": ["Estado del seguimiento", "Status do acompanhamento", "Status dalszych działań"],
  "Date observed": ["Fecha observada", "Data da observação", "Data zauważenia"],
  "Describe the issue": ["Describe el problema", "Descreva o problema", "Opisz problem"],
  "Observed unsafe condition": ["Condición insegura observada", "Condição insegura observada", "Zaobserwowany niebezpieczny stan"],
  "Pick the closest match so it can be linked to past unresolved issues. Choose Other if it's new.": [
    "Elige la opción más parecida para vincularla con problemas anteriores sin resolver. Elige Otra si es nueva.",
    "Escolha a opção mais parecida para ligá-la a problemas anteriores não resolvidos. Escolha Outra se for nova.",
    "Wybierz najbliższą opcję, aby powiązać ją z wcześniejszymi nierozwiązanymi problemami. Wybierz Inne, jeśli to coś nowego.",
  ],
  "Other (a new condition)": ["Otra (una condición nueva)", "Outra (uma condição nova)", "Inne (nowy stan)"],
  "Describe the new condition": ["Describe la condición nueva", "Descreva a condição nova", "Opisz nowy stan"],
  "e.g. Rebar caps missing on vertical bars near the east wall.": [
    "ej. Faltan tapas de varilla en las barras verticales cerca del muro este.",
    "ex. Faltam protetores nas pontas dos vergalhões verticais perto da parede leste.",
    "np. Brak osłon na pionowych prętach zbrojeniowych przy wschodniej ścianie.",
  ],
  "One short sentence. Similar new reports can be grouped later.": [
    "Una frase corta. Los reportes nuevos parecidos se pueden agrupar después.",
    "Uma frase curta. Relatos novos parecidos podem ser agrupados depois.",
    "Jedno krótkie zdanie. Podobne nowe zgłoszenia można później pogrupować.",
  ],
  "The permit board lacked an updated atmospheric test.": [
    "El tablero de permisos no tenía una prueba atmosférica actualizada.",
    "O quadro de permissões não tinha um teste atmosférico atualizado.",
    "Na tablicy zezwoleń brakowało aktualnego pomiaru atmosfery.",
  ],
  "A temporary power cord had damaged insulation near the connector.": [
    "Un cable de energía temporal tenía el aislamiento dañado cerca del conector.",
    "Um cabo de energia provisória tinha o isolamento danificado perto do conector.",
    "Przewód zasilania tymczasowego miał uszkodzoną izolację przy złączu.",
  ],
  "A crew manually lifted heavy fixtures without an available lifting aid.": [
    "Una cuadrilla levantó a mano accesorios pesados sin una ayuda de levantamiento disponible.",
    "Uma equipe levantou peças pesadas à mão sem um auxílio de levantamento disponível.",
    "Brygada ręcznie podnosiła ciężkie elementy bez dostępnego sprzętu do podnoszenia.",
  ],
  "Excavated material was stored too close to the trench edge.": [
    "El material excavado estaba demasiado cerca del borde de la zanja.",
    "O material escavado estava armazenado perto demais da borda da vala.",
    "Urobek był składowany zbyt blisko krawędzi wykopu.",
  ],
  "An unprotected floor opening was observed without a secured cover or guardrail.": [
    "Se observó una abertura en el piso sin tapa asegurada ni barandal.",
    "Foi observada uma abertura no piso sem tampa fixada nem guarda-corpo.",
    "Zauważono niezabezpieczony otwór w stropie bez pokrywy i barierki.",
  ],
  "Hot work began without a documented permit or nearby extinguisher.": [
    "Se comenzó trabajo en caliente sin permiso documentado ni extintor cercano.",
    "Trabalho a quente começou sem permissão documentada nem extintor por perto.",
    "Prace gorące rozpoczęto bez pisemnego zezwolenia i gaśnicy w pobliżu.",
  ],
  "Scrap material narrowed the designated access route and created a trip hazard.": [
    "El material de desecho estrechó la ruta de acceso y creó un riesgo de tropiezo.",
    "Sobras de material estreitaram a rota de acesso e criaram risco de tropeço.",
    "Odpady zwęziły wyznaczoną drogę dojścia i stworzyły ryzyko potknięcia.",
  ],
  "An extension ladder was set at an unsafe angle and was not secured.": [
    "Una escalera extensible estaba en un ángulo inseguro y no estaba asegurada.",
    "Uma escada extensível estava em ângulo inseguro e não estava presa.",
    "Drabina przystawna stała pod niebezpiecznym kątem i nie była zabezpieczona.",
  ],
  "A scaffold platform had an open gap and lacked a current inspection tag.": [
    "Una plataforma de andamio tenía un hueco abierto y no tenía etiqueta de inspección vigente.",
    "Uma plataforma de andaime tinha um vão aberto e não tinha etiqueta de inspeção válida.",
    "Pomost rusztowania miał szczelinę i brakowało aktualnej zawieszki kontrolnej.",
  ],
  "Pedestrian travel crossed an equipment route without a spotter.": [
    "El paso de peatones cruzaba una ruta de equipo sin un señalero.",
    "A passagem de pedestres cruzava uma rota de equipamentos sem sinaleiro.",
    "Ruch pieszych przecinał trasę sprzętu bez osoby asekurującej.",
  ],
  "Severity": ["Gravedad", "Gravidade", "Waga"],
  "Root cause": ["Causa raíz", "Causa raiz", "Przyczyna źródłowa"],
  "Status": ["Estado", "Status", "Status"],
  "Correct by": ["Corregir antes de", "Corrigir até", "Poprawić do"],
  "Closure date": ["Fecha de cierre", "Data de fechamento", "Data zamknięcia"],
  "Incident date": ["Fecha del incidente", "Data do incidente", "Data zdarzenia"],
  "Classification": ["Clasificación", "Classificação", "Klasyfikacja"],
  "OSHA hazard category": ["Categoría de peligro OSHA", "Categoria de perigo OSHA", "Kategoria zagrożenia OSHA"],
  "Hazard subcategory": ["Subcategoría de peligro", "Subcategoria de perigo", "Podkategoria zagrożenia"],
  "Body part injured": ["Parte del cuerpo lesionada", "Parte do corpo atingida", "Uszkodzona część ciała"],
  "LTA lesson number": ["Número de lección LTA", "Número da lição LTA", "Numer lekcji LTA"],
  "What happened?": ["¿Qué pasó?", "O que aconteceu?", "Co się stało?"],
  "Date": ["Fecha", "Data", "Data"],
  "Headcount": ["Número de personas", "Número de pessoas", "Liczba osób"],
  "Regular hours": ["Horas normales", "Horas normais", "Godziny podstawowe"],
  "Overtime hours": ["Horas extra", "Horas extras", "Nadgodziny"],
  "Total hours": ["Horas totales", "Total de horas", "Godziny łącznie"],
  "Main work activity": ["Actividad principal", "Atividade principal", "Główne prace"],
  "Weather": ["Clima", "Clima", "Pogoda"],
  "e.g. Damaged extension cord found before tools were energized.": [
    "ej. Extensión dañada encontrada antes de energizar las herramientas.",
    "ex. Extensão danificada encontrada antes de ligar as ferramentas.",
    "np. Uszkodzony przedłużacz znaleziony przed podłączeniem narzędzi.",
  ],
  "e.g. Cord removed from service.": ["ej. Extensión retirada de servicio.", "ex. Extensão retirada de uso.", "np. Przedłużacz wycofany z użytku."],
  "e.g. Unprotected floor opening without a secured cover or guardrail.": [
    "ej. Abertura en el piso sin tapa asegurada ni barandal.",
    "ex. Abertura no piso sem tampa fixada nem guarda-corpo.",
    "np. Niezabezpieczony otwór w stropie bez pokrywy i barierki.",
  ],
  "e.g. LTA-002": ["ej. LTA-002", "ex. LTA-002", "np. LTA-002"],
  "What the worker was doing, what happened, the injury, and the treatment given.": [
    "Qué hacía el trabajador, qué pasó, la lesión y el tratamiento dado.",
    "O que o trabalhador fazia, o que aconteceu, a lesão e o atendimento dado.",
    "Co robił pracownik, co się stało, jaki uraz i jakiej pomocy udzielono.",
  ],

  /* ---- Option values (display only) ---- */
  "Electrical": ["Eléctrico", "Elétrico", "Elektryczne"],
  "Fall Protection": ["Protección contra caídas", "Proteção contra quedas", "Ochrona przed upadkiem"],
  "Housekeeping": ["Orden y limpieza", "Organização e limpeza", "Porządek"],
  "Material Handling": ["Manejo de materiales", "Movimentação de materiais", "Przenoszenie materiałów"],
  "Struck-By": ["Golpeado por objeto", "Atingido por objeto", "Uderzenie przez obiekt"],
  "Low": ["Baja", "Baixa", "Niska"],
  "Medium": ["Media", "Média", "Średnia"],
  "High": ["Alta", "Alta", "Wysoka"],
  "Critical": ["Crítica", "Crítica", "Krytyczna"],
  "Open": ["Abierto", "Aberto", "Otwarte"],
  "In Progress": ["En proceso", "Em andamento", "W toku"],
  "Closed": ["Cerrado", "Fechado", "Zamknięte"],
  "Completed": ["Completado", "Concluído", "Zakończone"],
  "Not Required": ["No requerido", "Não necessário", "Niewymagane"],
  "Confined Space": ["Espacio confinado", "Espaço confinado", "Przestrzeń zamknięta"],
  "Ergonomics": ["Ergonomía", "Ergonomia", "Ergonomia"],
  "Excavation": ["Excavación", "Escavação", "Wykopy"],
  "Fire Prevention": ["Prevención de incendios", "Prevenção de incêndio", "Ochrona przeciwpożarowa"],
  "Ladders": ["Escaleras", "Escadas", "Drabiny"],
  "Scaffolding": ["Andamios", "Andaimes", "Rusztowania"],
  "Coordination": ["Coordinación", "Coordenação", "Koordynacja"],
  "Equipment": ["Equipo", "Equipamento", "Sprzęt"],
  "Guarding": ["Protecciones", "Proteções", "Osłony"],
  "Inspection": ["Inspección", "Inspeção", "Kontrola"],
  "Planning": ["Planificación", "Planejamento", "Planowanie"],
  "Procedure": ["Procedimiento", "Procedimento", "Procedura"],
  "First Aid": ["Primeros auxilios", "Primeiros socorros", "Pierwsza pomoc"],
  "REC (Recordable)": ["REC (Registrable)", "REC (Registrável)", "REC (Do rejestru)"],
  "Lost Time Accident": ["Accidente con tiempo perdido", "Acidente com afastamento", "Wypadek z absencją"],
  "Falls": ["Caídas", "Quedas", "Upadki"],
  "Caught-In or -Between": ["Atrapado en o entre", "Preso em ou entre", "Pochwycenie lub przygniecenie"],
  "Electrocution": ["Electrocución", "Eletrocussão", "Porażenie prądem"],
  "Other": ["Otro", "Outro", "Inne"],
  "Caught Between Equipment and Fixed Object": ["Atrapado entre equipo y objeto fijo", "Preso entre equipamento e objeto fixo", "Przygniecenie między sprzętem a stałym obiektem"],
  "Caught in Equipment": ["Atrapado en equipo", "Preso em equipamento", "Pochwycenie przez sprzęt"],
  "Contact with Energized Equipment": ["Contacto con equipo energizado", "Contato com equipamento energizado", "Kontakt z urządzeniem pod napięciem"],
  "Fall from Elevated Work Surface": ["Caída desde superficie elevada", "Queda de superfície elevada", "Upadek z podwyższenia"],
  "Falling or Shifting Object": ["Objeto que cae o se desplaza", "Objeto caindo ou se deslocando", "Spadający lub przesuwający się przedmiot"],
  "Flying Particles / Debris": ["Partículas o escombros volando", "Partículas / detritos lançados", "Odpryski / gruz"],
  "Hand Tool Cut or Contact": ["Corte o contacto con herramienta manual", "Corte ou contato com ferramenta manual", "Skaleczenie narzędziem ręcznym"],
  "Ladder Fall": ["Caída de escalera", "Queda de escada", "Upadek z drabiny"],
  "Manual Material Handling": ["Manejo manual de materiales", "Movimentação manual de materiais", "Ręczne przenoszenie materiałów"],
  "Moving Object or Equipment": ["Objeto o equipo en movimiento", "Objeto ou equipamento em movimento", "Poruszający się obiekt lub sprzęt"],
  "Overexertion / Body Mechanics": ["Sobreesfuerzo / postura", "Esforço excessivo / postura", "Przeciążenie / postawa ciała"],
  "Pinched Between Materials or Components": ["Prensado entre materiales o componentes", "Prensado entre materiais ou componentes", "Przyciśnięcie między materiałami lub elementami"],
  "Same-Level Slip / Trip": ["Resbalón / tropiezo al mismo nivel", "Escorregão / tropeço no mesmo nível", "Poślizgnięcie / potknięcie na tym samym poziomie"],
  "Temporary Power or Electrical Equipment Contact": ["Contacto con energía temporal o equipo eléctrico", "Contato com energia provisória ou equipamento elétrico", "Kontakt z zasilaniem tymczasowym lub sprzętem elektrycznym"],
  "Thermal Burn / Hot Work": ["Quemadura térmica / trabajo en caliente", "Queimadura térmica / trabalho a quente", "Oparzenie / prace gorące"],
  "Walking Surface / Debris": ["Superficie de paso / escombros", "Superfície de passagem / entulho", "Nawierzchnia / gruz"],
  "Ankle / Foot": ["Tobillo / pie", "Tornozelo / pé", "Kostka / stopa"],
  "Eye": ["Ojo", "Olho", "Oko"],
  "Forearm": ["Antebrazo", "Antebraço", "Przedramię"],
  "Hand / Finger": ["Mano / dedo", "Mão / dedo", "Dłoń / palec"],
  "Knee": ["Rodilla", "Joelho", "Kolano"],
  "Lower Back": ["Espalda baja", "Lombar", "Dolna część pleców"],
  "Lower Leg": ["Pierna (parte baja)", "Perna (parte inferior)", "Podudzie"],
  "Shoulder": ["Hombro", "Ombro", "Bark"],
  "Wrist": ["Muñeca", "Pulso", "Nadgarstek"],
  "Concrete placement": ["Colado de concreto", "Concretagem", "Betonowanie"],
  "Drywall and finishes": ["Tablaroca y acabados", "Drywall e acabamentos", "Płyty g-k i wykończenia"],
  "Excavation and grading": ["Excavación y nivelación", "Escavação e terraplanagem", "Wykopy i niwelacja"],
  "Overhead MEP rough-in": ["Instalaciones MEP en altura", "Instalações MEP no teto", "Instalacje MEP pod stropem"],
  "Roofing and envelope": ["Techos y envolvente", "Cobertura e fachada", "Dach i przegrody zewnętrzne"],
  "Structural framing": ["Estructura", "Estrutura", "Konstrukcja nośna"],
  "Systems testing": ["Pruebas de sistemas", "Testes de sistemas", "Testy instalacji"],
  "Clear": ["Despejado", "Céu limpo", "Bezchmurnie"],
  "Partly Cloudy": ["Parcialmente nublado", "Parcialmente nublado", "Częściowe zachmurzenie"],
  "Cloudy": ["Nublado", "Nublado", "Pochmurno"],
  "Rain": ["Lluvia", "Chuva", "Deszcz"],
  "Snow": ["Nieve", "Neve", "Śnieg"],
  "High Wind": ["Viento fuerte", "Vento forte", "Silny wiatr"],
  "Extreme Heat": ["Calor extremo", "Calor extremo", "Upał"],
  "Active": ["Activas", "Ativas", "Aktywne"],
  "Yes": ["Sí", "Sim", "Tak"],
  "No": ["No", "Não", "Nie"],
  "Select…": ["Selecciona…", "Selecione…", "Wybierz…"],
  "Select a job…": ["Selecciona una obra…", "Selecione uma obra…", "Wybierz budowę…"],

  /* ---- Form screen ---- */
  "How do you want to fill it in?": ["¿Cómo quieres llenarlo?", "Como você quer preencher?", "Jak chcesz go wypełnić?"],
  "Voice": ["Voz", "Voz", "Głos"],
  "Photo": ["Foto", "Foto", "Zdjęcie"],
  "Manual": ["Manual", "Manual", "Ręcznie"],
  "Review & submit": ["Revisar y enviar", "Revisar e enviar", "Sprawdź i wyślij"],
  "Keep at least one way to fill the form.": [
    "Deja al menos una forma de llenar el formulario.",
    "Mantenha pelo menos uma forma de preencher.",
    "Zostaw przynajmniej jeden sposób wypełniania.",
  ],
  "Filling the form…": ["Llenando el formulario…", "Preenchendo o formulário…", "Wypełnianie formularza…"],
  "AI · check": ["IA · revisar", "IA · conferir", "AI · sprawdź"],
  "I checked the {n} AI-filled fields": [
    "Revisé los {n} campos que llenó la IA",
    "Conferi os {n} campos preenchidos pela IA",
    "Sprawdziłem {n} pól wypełnionych przez AI",
  ],
  "AI can make mistakes. Check the results.": [
    "La IA puede equivocarse. Revisa los resultados.",
    "A IA pode errar. Confira os resultados.",
    "AI może się mylić. Sprawdź wyniki.",
  ],
  "AI looks at the photos and suggests values for empty fields.": [
    "La IA mira las fotos y sugiere valores para los campos vacíos.",
    "A IA analisa as fotos e sugere valores para os campos vazios.",
    "AI ogląda zdjęcia i proponuje wartości dla pustych pól.",
  ],
  "Check the AI-filled fields and tick the box before you submit.": [
    "Revisa los campos que llenó la IA y marca la casilla antes de enviar.",
    "Confira os campos preenchidos pela IA e marque a caixa antes de enviar.",
    "Sprawdź pola wypełnione przez AI i zaznacz pole wyboru przed wysłaniem.",
  ],
  "Everything the AI found is already filled in.": [
    "Todo lo que encontró la IA ya está lleno.",
    "Tudo o que a IA encontrou já está preenchido.",
    "Wszystko, co znalazła AI, jest już wypełnione.",
  ],
  "Check the filled fields before you submit.": [
    "Revisa los campos llenados antes de enviar.",
    "Confira os campos preenchidos antes de enviar.",
    "Sprawdź wypełnione pola przed wysłaniem.",
  ],
  "Couldn't find details to fill. Fill the form by hand.": [
    "No se encontraron datos para llenar. Llena el formulario a mano.",
    "Não foram encontrados dados para preencher. Preencha o formulário à mão.",
    "Nie znaleziono danych do wypełnienia. Wypełnij formularz ręcznie.",
  ],
  "Couldn't fill the form. Try again or fill it by hand.": [
    "No se pudo llenar el formulario. Inténtalo de nuevo o llénalo a mano.",
    "Não foi possível preencher o formulário. Tente de novo ou preencha à mão.",
    "Nie udało się wypełnić formularza. Spróbuj ponownie lub wypełnij ręcznie.",
  ],
  "Stop recording": ["Detener grabación", "Parar gravação", "Zatrzymaj nagrywanie"],
  "Start recording": ["Empezar a grabar", "Começar a gravar", "Rozpocznij nagrywanie"],
  "Recording… {time}": ["Grabando… {time}", "Gravando… {time}", "Nagrywanie… {time}"],
  "Tap to add another clip": ["Toca para agregar otro audio", "Toque para adicionar outro áudio", "Dotknij, aby dodać kolejne nagranie"],
  "Clip {n}": ["Audio {n}", "Áudio {n}", "Nagranie {n}"],
  "Remove clip {n}": ["Quitar audio {n}", "Remover áudio {n}", "Usuń nagranie {n}"],
  "What happened (you can edit this)": ["Qué pasó (puedes editarlo)", "O que aconteceu (você pode editar)", "Co się stało (możesz to edytować)"],
  "Talk or type": ["Habla o escribe", "Fale ou digite", "Mów lub pisz"],
  "Tap the mic to talk, or type below": ["Toca el micrófono para hablar o escribe abajo", "Toque no microfone para falar ou digite abaixo", "Dotknij mikrofonu, aby mówić, lub pisz poniżej"],
  "Fill the form with AI": ["Llenar el formulario con IA", "Preencher o formulário com IA", "Wypełnij formularz z AI"],
  "Turning your voice into text…": ["Convirtiendo tu voz en texto…", "Transformando sua voz em texto…", "Zamiana głosu na tekst…"],
  "Couldn't use the microphone. Allow it in your browser settings.": [
    "No se pudo usar el micrófono. Permítelo en la configuración del navegador.",
    "Não foi possível usar o microfone. Permita-o nas configurações do navegador.",
    "Nie można użyć mikrofonu. Zezwól na niego w ustawieniach przeglądarki.",
  ],
  "Didn't catch any words. Check your microphone and try again.": [
    "No se escuchó ninguna palabra. Revisa el micrófono e inténtalo de nuevo.",
    "Nenhuma palavra foi captada. Verifique o microfone e tente de novo.",
    "Nie wychwycono żadnych słów. Sprawdź mikrofon i spróbuj ponownie.",
  ],
  "Couldn't turn the recording into text. Try again.": [
    "No se pudo convertir la grabación en texto. Inténtalo de nuevo.",
    "Não foi possível transformar a gravação em texto. Tente de novo.",
    "Nie udało się zamienić nagrania na tekst. Spróbuj ponownie.",
  ],
  "Take photo": ["Tomar foto", "Tirar foto", "Zrób zdjęcie"],
  "Upload": ["Subir", "Enviar arquivo", "Prześlij"],
  "or drag images here": ["o arrastra imágenes aquí", "ou arraste imagens aqui", "lub przeciągnij zdjęcia tutaj"],
  "Fill form from photos": ["Llenar con las fotos", "Preencher com as fotos", "Wypełnij ze zdjęć"],
  "AI suggestion": ["Sugerencia de IA", "Sugestão da IA", "Sugestia AI"],
  "Analyzing photos…": ["Analizando fotos…", "Analisando fotos…", "Analiza zdjęć…"],
  "AI suggestion filled in from the photos. Check it before you submit.": [
    "Se llenó una sugerencia de IA a partir de las fotos. Revísala antes de enviar.",
    "Sugestão da IA preenchida a partir das fotos. Confira antes de enviar.",
    "Wpisano sugestię AI na podstawie zdjęć. Sprawdź ją przed wysłaniem.",
  ],
  "Couldn't find anything new to fill from the photos.": [
    "No se encontró nada nuevo para llenar con las fotos.",
    "Não foi encontrado nada novo para preencher com as fotos.",
    "Na zdjęciach nie znaleziono nic nowego do wpisania.",
  ],
  "Couldn't read the photos. Try again or fill it by hand.": [
    "No se pudieron leer las fotos. Inténtalo de nuevo o llénalo a mano.",
    "Não foi possível ler as fotos. Tente de novo ou preencha à mão.",
    "Nie udało się odczytać zdjęć. Spróbuj ponownie lub wypełnij ręcznie.",
  ],
  "Photo {n}": ["Foto {n}", "Foto {n}", "Zdjęcie {n}"],
  "Only the first 5 photos are saved with the report.": [
    "Solo se guardan las primeras 5 fotos con el reporte.",
    "Só as primeiras 5 fotos são salvas com o relato.",
    "Do zgłoszenia zapisywanych jest tylko 5 pierwszych zdjęć.",
  ],
  "Some photos couldn't be saved. Up to 5 photos are kept with a report.": [
    "Algunas fotos no se pudieron guardar. Se guardan hasta 5 fotos por reporte.",
    "Algumas fotos não foram salvas. Até 5 fotos ficam com cada relato.",
    "Nie udało się zapisać części zdjęć. Do zgłoszenia zapisuje się do 5 zdjęć.",
  ],
  "Remove photo {n}": ["Quitar foto {n}", "Remover foto {n}", "Usuń zdjęcie {n}"],
  "Form details": ["Datos del formulario", "Dados do formulário", "Szczegóły formularza"],
  "Review fields": ["Revisar campos", "Revisar campos", "Sprawdź pola"],
  "Hide": ["Ocultar", "Ocultar", "Ukryj"],
  "Show": ["Mostrar", "Mostrar", "Pokaż"],
  "These get filled in from your {sources}. Open them to check or correct anything.": [
    "Se llenan a partir de: {sources}. Ábrelos para revisar o corregir.",
    "São preenchidos a partir de: {sources}. Abra para conferir ou corrigir.",
    "Zostaną uzupełnione na podstawie: {sources}. Otwórz, aby sprawdzić lub poprawić.",
  ],
  "voice": ["voz", "voz", "nagranie głosowe"],
  "photos": ["fotos", "fotos", "zdjęcia"],
  "This is required.": ["Este campo es obligatorio.", "Este campo é obrigatório.", "To pole jest wymagane."],
  "Enter a number of {min} or more.": ["Escribe un número de {min} o más.", "Digite um número igual ou maior que {min}.", "Wpisz liczbę {min} lub większą."],
  "This date can't be in the future.": ["Esta fecha no puede ser futura.", "Esta data não pode ser no futuro.", "Ta data nie może być z przyszłości."],
  "Can't be before “{field}”.": ["No puede ser antes de “{field}”.", "Não pode ser antes de “{field}”.", "Nie może być wcześniej niż „{field}”."],
  "Required: {done} of {total}": ["Obligatorios: {done} de {total}", "Obrigatórios: {done} de {total}", "Wymagane: {done} z {total}"],
  "Fields that need attention: {n}": ["Campos por revisar: {n}", "Campos que precisam de atenção: {n}", "Pola do poprawienia: {n}"],

  /* ---- Done screen ---- */
  "{form} sent": ["{form}: enviado", "{form}: enviado", "{form}: wysłane"],
  "{form} saved": ["{form}: guardado", "{form}: salvo", "{form}: zapisane"],
  "The safety team can see it now. You can follow its status in My reports.": [
    "El equipo de seguridad ya lo puede ver. Puedes seguir su estado en Mis reportes.",
    "A equipe de segurança já pode ver. Você pode acompanhar o status em Meus relatos.",
    "Zespół BHP już to widzi. Status możesz śledzić w Moich zgłoszeniach.",
  ],
  "Couldn't reach the server, so it's saved on this device only. Try again when you're back online.": [
    "No se pudo conectar con el servidor, así que solo se guardó en este dispositivo. Inténtalo de nuevo cuando tengas conexión.",
    "Não foi possível conectar ao servidor, então foi salvo só neste aparelho. Tente de novo quando estiver online.",
    "Nie udało się połączyć z serwerem, więc zapisano to tylko na tym urządzeniu. Spróbuj ponownie po odzyskaniu połączenia.",
  ],
  "Sending…": ["Enviando…", "Enviando…", "Wysyłanie…"],
  "Submitted": ["Enviado", "Enviado", "Wysłane"],
  "View in My reports": ["Ver en Mis reportes", "Ver em Meus relatos", "Zobacz w Moich zgłoszeniach"],
  "Attachments": ["Adjuntos", "Anexos", "Załączniki"],
  "Photos: {n}": ["Fotos: {n}", "Fotos: {n}", "Zdjęcia: {n}"],
  "Voice clips: {n}": ["Audios: {n}", "Áudios: {n}", "Nagrania: {n}"],
  "Written description": ["Descripción escrita", "Descrição escrita", "Opis pisemny"],
  "New: {form}": ["Nuevo: {form}", "Novo: {form}", "Nowe: {form}"],

  /* ---- Profile ---- */
  "My profile": ["Mi perfil", "Meu perfil", "Mój profil"],
  "Carpenter Foreman": ["Capataz de carpintería", "Encarregado de carpintaria", "Brygadzista cieśli"],
  "Reporting since {date}": ["Reportando desde {date}", "Relatando desde {date}", "Zgłasza od {date}"],
  "Sample profile": ["Perfil de ejemplo", "Perfil de exemplo", "Przykładowy profil"],
  "Reports submitted": ["Reportes enviados", "Relatos enviados", "Wysłane zgłoszenia"],
  "Good Catches": ["Buenas detecciones", "Boas observações", "Wychwycone zagrożenia"],
  "Resolved": ["Resueltos", "Resolvidos", "Rozwiązane"],
  "My reports": ["Mis reportes", "Meus relatos", "Moje zgłoszenia"],
  "Filter reports by form": ["Filtrar reportes por formulario", "Filtrar relatos por formulário", "Filtruj zgłoszenia według formularza"],
  "All": ["Todos", "Todos", "Wszystkie"],
  "Not sent": ["No enviado", "Não enviado", "Niewysłane"],
  "Saved on device": ["Guardado en el dispositivo", "Salvo no aparelho", "Zapisane na urządzeniu"],
  "Review complete": ["Revisión completa", "Análise concluída", "Analiza zakończona"],
  "Follow-up open": ["Seguimiento abierto", "Acompanhamento aberto", "Dalsze działania otwarte"],
  "No follow-up needed": ["Sin seguimiento necesario", "Sem acompanhamento", "Bez dalszych działań"],
  "Filed": ["Registrado", "Registrado", "Złożone"],
  "How it was resolved": ["Cómo se resolvió", "Como foi resolvido", "Jak to rozwiązano"],
  "Latest update": ["Última actualización", "Última atualização", "Ostatnia aktualizacja"],
  "Saved on this device only. It couldn't be sent.": [
    "Guardado solo en este dispositivo. No se pudo enviar.",
    "Salvo só neste aparelho. Não foi possível enviar.",
    "Zapisane tylko na tym urządzeniu. Nie udało się go wysłać.",
  ],
  "Remove": ["Quitar", "Remover", "Usuń"],
  "Remove this report from this device?": ["¿Quitar este reporte de este dispositivo?", "Remover este relato deste aparelho?", "Usunąć to zgłoszenie z tego urządzenia?"],
  "Report removed.": ["Reporte eliminado.", "Relato removido.", "Zgłoszenie usunięte."],
  "No reports yet": ["Aún no hay reportes", "Nenhum relato ainda", "Brak zgłoszeń"],
  "Reports you submit will show up here with their status.": [
    "Los reportes que envíes aparecerán aquí con su estado.",
    "Os relatos que você enviar aparecerão aqui com o status.",
    "Wysłane zgłoszenia pojawią się tutaj wraz ze statusem.",
  ],
  "Start a report": ["Hacer un reporte", "Fazer um relato", "Zrób zgłoszenie"],
  "Loading your reports…": ["Cargando tus reportes…", "Carregando seus relatos…", "Wczytywanie zgłoszeń…"],
  "Couldn't load your reports from the server.": [
    "No se pudieron cargar tus reportes del servidor.",
    "Não foi possível carregar seus relatos do servidor.",
    "Nie udało się wczytać zgłoszeń z serwera.",
  ],
  "You can change or delete this until the safety team picks it up.": [
    "Puedes cambiarlo o borrarlo hasta que el equipo de seguridad lo tome.",
    "Você pode alterar ou excluir até a equipe de segurança assumir.",
    "Możesz to zmienić lub usunąć, dopóki zespół BHP się tym nie zajmie.",
  ],
  "Locked: the safety team has picked this up.": [
    "Bloqueado: el equipo de seguridad ya lo tomó.",
    "Bloqueado: a equipe de segurança já assumiu.",
    "Zablokowane: zespół BHP już się tym zajął.",
  ],
  "Edit": ["Editar", "Editar", "Edytuj"],
  "Delete": ["Borrar", "Excluir", "Usuń"],
  "Delete this report? This can't be undone.": [
    "¿Borrar este reporte? No se puede deshacer.",
    "Excluir este relato? Não dá para desfazer.",
    "Usunąć to zgłoszenie? Tego nie można cofnąć.",
  ],
  "Report deleted.": ["Reporte borrado.", "Relato excluído.", "Zgłoszenie usunięte."],
  "Couldn't delete it. The safety team may have already picked it up.": [
    "No se pudo borrar. Puede que el equipo de seguridad ya lo haya tomado.",
    "Não foi possível excluir. A equipe de segurança pode já ter assumido.",
    "Nie udało się usunąć. Zespół BHP mógł już się tym zająć.",
  ],
  "Save changes": ["Guardar cambios", "Salvar alterações", "Zapisz zmiany"],
  "Couldn't save changes. The safety team may have already picked this up.": [
    "No se pudieron guardar los cambios. Puede que el equipo de seguridad ya lo haya tomado.",
    "Não foi possível salvar. A equipe de segurança pode já ter assumido.",
    "Nie udało się zapisać zmian. Zespół BHP mógł już się tym zająć.",
  ],
  "{form} updated": ["{form}: actualizado", "{form}: atualizado", "{form}: zaktualizowane"],
  "Your changes are saved. You can follow its status in My reports.": [
    "Tus cambios se guardaron. Puedes seguir su estado en Mis reportes.",
    "Suas alterações foram salvas. Acompanhe o status em Meus relatos.",
    "Zmiany zapisane. Status możesz śledzić w Moich zgłoszeniach.",
  ],

  /* ---- Resources page ---- */
  "Looking after your head is part of working safe. These services are free and confidential, for you or a coworker.": [
    "Cuidar tu salud mental es parte de trabajar seguro. Estos servicios son gratuitos y confidenciales, para ti o un compañero.",
    "Cuidar da cabeça faz parte de trabalhar com segurança. Estes serviços são gratuitos e confidenciais, para você ou um colega.",
    "Dbanie o głowę to część bezpiecznej pracy. Te usługi są bezpłatne i poufne, dla ciebie lub kolegi.",
  ],
  "If someone is in immediate danger, call 911. Don't leave them alone.": [
    "Si alguien está en peligro inmediato, llama al 911. No lo dejes solo.",
    "Se alguém estiver em perigo imediato, ligue para o 911. Não deixe a pessoa sozinha.",
    "Jeśli ktoś jest w bezpośrednim niebezpieczeństwie, dzwoń pod 911. Nie zostawiaj go samego.",
  ],
  "Crisis support, 24/7": ["Apoyo en crisis, 24/7", "Apoio em crise, 24h", "Wsparcie kryzysowe, 24/7"],
  "Free and confidential. You don't have to be suicidal to reach out. Call if you're overwhelmed or worried about someone else.": [
    "Gratis y confidencial. No tienes que tener pensamientos suicidas para llamar. Llama si te sientes abrumado o te preocupa alguien.",
    "Grátis e confidencial. Você não precisa estar pensando em suicídio para ligar. Ligue se estiver sobrecarregado ou preocupado com alguém.",
    "Bezpłatnie i poufnie. Nie musisz mieć myśli samobójczych, żeby zadzwonić. Dzwoń, jeśli jesteś przytłoczony lub martwisz się o kogoś.",
  ],
  "Talk to a trained crisis counselor by phone, text or online chat. Press 2 for Spanish. Veterans press 1.": [
    "Habla con un consejero de crisis capacitado por teléfono, mensaje de texto o chat. Marca 2 para español. Veteranos, marquen 1.",
    "Fale com um conselheiro de crise treinado por telefone, mensagem ou chat. Tecle 2 para espanhol, 1 para veteranos. Há intérpretes para outros idiomas, incluindo português.",
    "Porozmawiaj z przeszkolonym doradcą kryzysowym przez telefon, SMS lub czat. Wciśnij 2 dla hiszpańskiego, 1 dla weteranów. Dostępni są tłumacze innych języków, w tym polskiego.",
  ],
  "24/7": ["24/7", "24h", "24/7"],
  "English & Spanish": ["Inglés y español", "Inglês e espanhol", "Angielski i hiszpański"],
  "Call 988": ["Llamar al 988", "Ligar para 988", "Zadzwoń na 988"],
  "Text 988": ["Mensaje al 988", "Mensagem para 988", "SMS na 988"],
  "Chat online": ["Chat en línea", "Chat online", "Czat online"],
  "Text with a trained volunteer crisis counselor. Good when you can't talk out loud on site.": [
    "Escríbete con un consejero voluntario capacitado. Útil cuando no puedes hablar en voz alta en la obra.",
    "Converse por mensagem com um conselheiro voluntário treinado. Bom quando não dá para falar alto na obra.",
    "Pisz z przeszkolonym wolontariuszem. Przydatne, gdy nie możesz rozmawiać na głos na budowie.",
  ],
  "Text": ["Mensaje", "Mensagem", "SMS"],
  "Text HOME to 741741": ["Envía HOME al 741741", "Envie HOME para 741741", "Wyślij HOME na 741741"],
  "Website": ["Sitio web", "Site", "Strona"],
  "For veterans, service members and the people who support them.": [
    "Para veteranos, militares en servicio y quienes los apoyan.",
    "Para veteranos, militares da ativa e quem os apoia.",
    "Dla weteranów, żołnierzy i osób, które ich wspierają.",
  ],
  "Call 988, press 1": ["Llama al 988, marca 1", "Ligue 988, tecle 1", "Zadzwoń na 988, wciśnij 1"],
  "Text 838255": ["Mensaje al 838255", "Mensagem para 838255", "SMS na 838255"],
  "Employee Assistance Program (EAP)": ["Programa de Asistencia al Empleado (EAP)", "Programa de Assistência ao Empregado (EAP)", "Program Pomocy Pracownikom (EAP)"],
  "Free, confidential counseling for you and your household, usually including help with stress, grief, money, and alcohol or drug use. EAP services are confidential.": [
    "Consejería gratuita y confidencial para ti y tu familia, que suele incluir ayuda con estrés, duelo, dinero y consumo de alcohol o drogas. Los servicios del EAP son confidenciales.",
    "Aconselhamento gratuito e confidencial para você e sua família, geralmente com ajuda para estresse, luto, dinheiro e uso de álcool ou drogas. Os serviços do EAP são confidenciais.",
    "Bezpłatne, poufne poradnictwo dla ciebie i domowników, zwykle obejmujące stres, żałobę, finanse oraz alkohol lub narkotyki. Usługi EAP są poufne.",
  ],
  "Ask HR or your superintendent for the EAP phone number.": [
    "Pide el número del EAP a Recursos Humanos o a tu superintendente.",
    "Peça o telefone do EAP ao RH ou ao seu superintendente.",
    "Numer EAP uzyskasz w dziale kadr lub u kierownika budowy.",
  ],
  "Call {phone}": ["Llamar al {phone}", "Ligar para {phone}", "Zadzwoń: {phone}"],
  "Substance use": ["Uso de sustancias", "Uso de substâncias", "Uzależnienia"],
  "Help with alcohol, opioids or other drugs, for yourself or someone you care about.": [
    "Ayuda con alcohol, opioides u otras drogas, para ti o para alguien que te importa.",
    "Ajuda com álcool, opioides ou outras drogas, para você ou alguém querido.",
    "Pomoc w problemach z alkoholem, opioidami lub innymi narkotykami, dla ciebie lub bliskiej osoby.",
  ],
  "Free, confidential treatment referral and information service. Can point you to local treatment, support groups and community programs. Available in English and Spanish.": [
    "Servicio gratuito y confidencial de información y referencia a tratamiento. Te orienta sobre tratamiento local, grupos de apoyo y programas comunitarios. En inglés y español.",
    "Serviço gratuito e confidencial de informação e encaminhamento para tratamento. Indica tratamento local, grupos de apoio e programas comunitários. Em inglês e espanhol.",
    "Bezpłatna, poufna informacja i skierowania na leczenie. Wskaże lokalne leczenie, grupy wsparcia i programy. Po angielsku i hiszpańsku.",
  ],
  "Call 1-800-662-4357": ["Llamar al 1-800-662-4357", "Ligar para 1-800-662-4357", "Zadzwoń: 1-800-662-4357"],
  "Find treatment near you": ["Buscar tratamiento cerca", "Encontrar tratamento perto", "Znajdź leczenie w pobliżu"],
  "Find local and online AA meetings.": ["Busca reuniones de AA locales y en línea.", "Encontre reuniões de AA presenciais e online.", "Znajdź spotkania AA na miejscu i online."],
  "Find local and online NA meetings.": ["Busca reuniones de NA locales y en línea.", "Encontre reuniões de NA presenciais e online.", "Znajdź spotkania NA na miejscu i online."],
  "Find a meeting": ["Buscar reunión", "Encontrar reunião", "Znajdź spotkanie"],
  "For the construction industry": ["Para la industria de la construcción", "Para a construção civil", "Dla branży budowlanej"],
  "Construction has one of the highest suicide rates of any industry. These groups focus on our trades.": [
    "La construcción tiene una de las tasas de suicidio más altas de todas las industrias. Estos grupos se enfocan en nuestros oficios.",
    "A construção tem uma das maiores taxas de suicídio entre todos os setores. Estes grupos são focados nos nossos ofícios.",
    "Budownictwo ma jeden z najwyższych wskaźników samobójstw ze wszystkich branż. Te organizacje skupiają się na naszych zawodach.",
  ],
  "Toolbox talks, stand-down materials and resources for crews and supervisors.": [
    "Charlas de seguridad, materiales para pausas de seguridad y recursos para cuadrillas y supervisores.",
    "Diálogos de segurança, materiais para paradas de segurança e recursos para equipes e supervisores.",
    "Pogadanki BHP, materiały na przerwy bezpieczeństwa i zasoby dla brygad i nadzoru.",
  ],
  "Visit website": ["Visitar sitio web", "Visitar site", "Odwiedź stronę"],
  "Signs a coworker may be struggling": ["Señales de que un compañero puede estar pasando un mal momento", "Sinais de que um colega pode estar passando por dificuldades", "Oznaki, że kolega może mieć trudności"],
  "Talking about being a burden, feeling trapped, or having no reason to live": [
    "Habla de ser una carga, sentirse atrapado o no tener razón para vivir",
    "Fala em ser um peso, sentir-se preso ou não ter motivo para viver",
    "Mówi o byciu ciężarem, poczuciu osaczenia lub braku powodu do życia",
  ],
  "Increased drinking or drug use, or showing up impaired": [
    "Bebe o consume drogas más, o llega bajo los efectos",
    "Mais bebida ou drogas, ou chega sob efeito",
    "Więcej pije lub bierze, albo przychodzi pod wpływem",
  ],
  "Pulling away from the crew, family or things they used to enjoy": [
    "Se aleja de la cuadrilla, la familia o lo que antes disfrutaba",
    "Se afasta da equipe, da família ou do que gostava de fazer",
    "Odsuwa się od brygady, rodziny lub tego, co kiedyś lubił",
  ],
  "Big mood swings, anger, or seeming unusually calm after a hard stretch": [
    "Cambios fuertes de humor, enojo o una calma inusual después de una mala racha",
    "Mudanças fortes de humor, raiva ou calma incomum depois de uma fase difícil",
    "Duże wahania nastroju, złość lub nietypowy spokój po trudnym okresie",
  ],
  "More near misses, mistakes or absences than usual": [
    "Más casi-accidentes, errores o faltas de lo normal",
    "Mais quase-acidentes, erros ou faltas que o normal",
    "Więcej zdarzeń potencjalnie wypadkowych, błędów lub nieobecności niż zwykle",
  ],
  "Giving away tools or belongings, or saying goodbye": [
    "Regala herramientas o pertenencias, o se despide",
    "Dá ferramentas ou pertences, ou se despede",
    "Rozdaje narzędzia lub rzeczy albo się żegna",
  ],
  "How to help": ["Cómo ayudar", "Como ajudar", "Jak pomóc"],
  "Ask": ["Pregunta", "Pergunte", "Zapytaj"],
  "Ask directly: \"Are you thinking about suicide?\" Asking doesn't plant the idea. It opens the door.": [
    "Pregunta directamente: \"¿Estás pensando en suicidarte?\" Preguntar no le da la idea. Abre la puerta.",
    "Pergunte diretamente: \"Você está pensando em suicídio?\" Perguntar não dá a ideia. Abre a porta.",
    "Zapytaj wprost: „Czy myślisz o samobójstwie?” Pytanie nie podsuwa pomysłu. Otwiera drzwi do rozmowy.",
  ],
  "Listen": ["Escucha", "Escute", "Słuchaj"],
  "Let them talk. Don't argue or try to fix it on the spot.": [
    "Deja que hable. No discutas ni intentes arreglarlo en ese momento.",
    "Deixe a pessoa falar. Não discuta nem tente resolver na hora.",
    "Pozwól mu mówić. Nie kłóć się i nie próbuj od razu wszystkiego naprawiać.",
  ],
  "Stay": ["Quédate", "Fique", "Zostań"],
  "If they're in danger, don't leave them alone. Remove access to anything they could use to hurt themselves.": [
    "Si está en peligro, no lo dejes solo. Retira cualquier cosa con la que pueda hacerse daño.",
    "Se a pessoa estiver em perigo, não a deixe sozinha. Afaste qualquer coisa que ela possa usar para se machucar.",
    "Jeśli jest w niebezpieczeństwie, nie zostawiaj go samego. Usuń wszystko, czym mógłby zrobić sobie krzywdę.",
  ],
  "Connect": ["Conecta", "Conecte", "Połącz"],
  "Call or text 988 together, or bring in your supervisor or the EAP.": [
    "Llamen o escriban al 988 juntos, o involucra a tu supervisor o al EAP.",
    "Liguem ou mandem mensagem para o 988 juntos, ou chame seu supervisor ou o EAP.",
    "Zadzwońcie lub napiszcie razem na 988 albo zaangażuj przełożonego lub EAP.",
  ],
  "Follow up": ["Da seguimiento", "Acompanhe", "Sprawdzaj"],
  "Check in over the next days. It matters more than you think.": [
    "Pregúntale cómo está en los próximos días. Importa más de lo que crees.",
    "Procure saber como a pessoa está nos próximos dias. Isso importa mais do que você imagina.",
    "Odezwij się w kolejnych dniach. To ważniejsze, niż myślisz.",
  ],
  "Nothing on this page is tracked or reported. Links to outside services open in a new tab.": [
    "Nada en esta página se rastrea ni se reporta. Los enlaces externos se abren en otra pestaña.",
    "Nada nesta página é rastreado ou relatado. Links externos abrem em outra aba.",
    "Nic na tej stronie nie jest śledzone ani zgłaszane. Linki zewnętrzne otwierają się w nowej karcie.",
  ],
};

const LANG_INDEX = { es: 0, pt: 1, pl: 2 };

let currentLang = (() => {
  try {
    const saved = localStorage.getItem("lang");
    if (LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch { /* storage unavailable */ }
  const nav = (navigator.language || "en").slice(0, 2);
  return LANGUAGES.some((l) => l.code === nav) ? nav : "en";
})();

/** Translate English UI text into the current language. */
function t(text, vars) {
  let out = text;
  if (currentLang !== "en") out = I18N[text]?.[LANG_INDEX[currentLang]] ?? text;
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return out;
}

/** BCP 47 tag for the current language (for dates, lists, <html lang>). */
function langTag() {
  return LANGUAGES.find((l) => l.code === currentLang).htmlLang;
}

function setLang(code) {
  if (!LANGUAGES.some((l) => l.code === code)) return;
  currentLang = code;
  try { localStorage.setItem("lang", code); } catch { /* storage unavailable */ }
  document.documentElement.lang = langTag();
}
