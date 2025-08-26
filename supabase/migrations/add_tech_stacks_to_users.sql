-- Add tech_stacks column to users table (JSONB array of tech stack names)
ALTER TABLE public.users ADD COLUMN tech_stacks JSONB DEFAULT '[]'::jsonb;

-- Create function to validate tech stack entries
CREATE OR REPLACE FUNCTION validate_tech_stacks(tech_stacks JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if it's an array
  IF jsonb_typeof(tech_stacks) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if all items are strings
  FOR i IN 0..jsonb_array_length(tech_stacks) - 1 LOOP
    IF jsonb_typeof(tech_stacks->i) != 'string' THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure tech_stacks is a valid JSON array
ALTER TABLE public.users ADD CONSTRAINT tech_stacks_is_valid_array 
  CHECK (validate_tech_stacks(tech_stacks));