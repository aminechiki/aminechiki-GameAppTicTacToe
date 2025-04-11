
--- creazione della tabella per contenere le partite

CREATE TABLE IF NOT EXISTS public.matchs
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    match_code character varying(10) COLLATE pg_catalog."default" NOT NULL,
    cell_01 integer DEFAULT 0,
    cell_02 integer DEFAULT 0,
    cell_03 integer DEFAULT 0,
    cell_11 integer DEFAULT 0,
    cell_12 integer DEFAULT 0,
    cell_13 integer DEFAULT 0,
    cell_21 integer DEFAULT 0,
    cell_22 integer DEFAULT 0,
    cell_23 integer DEFAULT 0,
    current_player integer DEFAULT 0,
    current_turn integer NOT NULL,
    winner integer,
    move_count integer DEFAULT 0,
    time_start_match timestamp without time zone DEFAULT now(),
    is_remote_match boolean DEFAULT false,
    CONSTRAINT matchs_pkey PRIMARY KEY (id),
    CONSTRAINT matchs_match_code_key UNIQUE (match_code)
)

TABLESPACE pg_default;

ALTER TABLE public.matchs
    OWNER to postgres;

-- funzione per l'inserimento delle mosse

CREATE OR REPLACE FUNCTION public.insert_move(
	p_match_code character varying,
	p_player integer,
	p_cell integer)
    RETURNS TABLE(id uuid, match_code character varying, cell_01 integer, cell_02 integer, cell_03 integer, cell_11 integer, cell_12 integer, cell_13 integer, cell_21 integer, cell_22 integer, cell_23 integer, current_player integer, current_turn integer, winner integer, move_count integer, time_start_match timestamp without time zone, is_remote_match boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE
    sql TEXT;
    p_is_remote_match boolean;
    p_current_player integer;
    v_winner integer := 0;
    p_valid_move integer := 0;
    p_move_count integer := 0;
BEGIN

    -- Verifica la validità della cella e costruisci l'istruzione SQL per l'aggiornamento
    IF p_cell = 1 THEN
        UPDATE matchs SET cell_01 = p_player WHERE matchs.match_code = p_match_code and matchs.cell_01 = 0;
    ELSIF p_cell = 2 THEN
        UPDATE matchs SET cell_02 = p_player WHERE matchs.match_code = p_match_code and matchs.cell_02 = 0;
    ELSIF p_cell = 3 THEN
        UPDATE matchs SET cell_03 = p_player WHERE matchs.match_code = p_match_code and matchs.cell_03 = 0;
    ELSIF p_cell = 4 THEN
        UPDATE matchs SET cell_11 = p_player WHERE matchs.match_code = p_match_code and matchs.cell_11 = 0;
    ELSIF p_cell = 5 THEN
        UPDATE matchs SET cell_12 = p_player WHERE matchs.match_code = p_match_code and matchs.cell_12 = 0;
    ELSIF p_cell = 6 THEN
        UPDATE matchs SET cell_13 = p_player WHERE matchs.match_code = p_match_code and matchs.cell_13 = 0;
    ELSIF p_cell = 7 THEN
        UPDATE matchs SET cell_21 = p_player WHERE matchs.match_code = p_match_code and matchs.cell_21 = 0;
    ELSIF p_cell = 8 THEN
        UPDATE matchs SET cell_22 = p_player WHERE matchs.match_code = p_match_code and matchs.cell_22 = 0;
    ELSIF p_cell = 9 THEN
        UPDATE matchs SET cell_23 = p_player WHERE matchs.match_code = p_match_code and matchs.cell_23 = 0;
    END IF;

    -- setta p_valid_move = al numero di righe modificate ---> se > 0 mossa valida (RITORNO DELLE RIGHE MODIFICATE DA UPDATE)
    GET DIAGNOSTICS p_valid_move = ROW_COUNT;

    -- se la mossa eseguita è valida allora esegue il cabio del turno del giocatore e incrementa il numero di mosse
    IF p_valid_move != 0 THEN

        -- fa il cambio del giocatore per la prossima giocata
        SELECT matchs.current_player  INTO p_current_player  FROM matchs WHERE matchs.match_code = p_match_code;      
        IF p_current_player = 1 THEN
            UPDATE matchs SET current_player = 2 WHERE matchs.match_code = p_match_code;
        ELSE
            UPDATE matchs SET current_player = 1 WHERE matchs.match_code = p_match_code;
        END IF;
        
        -- incrementa il numero di mosse
        SELECT matchs.move_count  INTO p_move_count  FROM matchs WHERE matchs.match_code = p_match_code;
        -- column "matchs" of relation "matchs" does not exist
         UPDATE matchs SET move_count = p_move_count + 1 WHERE matchs.match_code = p_match_code and matchs.cell_23 = 0;

    END IF;

    -- Restituisci il risultato aggiornato
    RETURN QUERY SELECT * FROM matchs WHERE matchs.match_code = p_match_code;
END;
$BODY$;

ALTER FUNCTION public.insert_move(p_match_code character varying, p_player integer, p_cell integer)
    OWNER TO postgres;



-- crea una nuova partita

CREATE OR REPLACE FUNCTION public.match_code(
	p_match_code character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$

BEGIN

    SET TIME ZONE 'Europe/Rome';

    -- crea la struttura iniziale della partita
    INSERT INTO public.matchs (
        match_code, 

        cell_01, cell_02, cell_03, 
        cell_11, cell_12, cell_13, 
        cell_21, cell_22, cell_23, 

        current_player,
        current_turn, 
        winner, 
        move_count,
        time_start_match
    ) 
    VALUES (
        p_match_code,

        0, 0, 0,    
        0, 0, 0,   
        0, 0, 0,    

        1,
        1,          
        NULL,        
        0,
        now()
    );

    RETURN p_match_code;
END;
$BODY$;

ALTER FUNCTION public.match_code(p_match_code character varying)
    OWNER TO postgres;
