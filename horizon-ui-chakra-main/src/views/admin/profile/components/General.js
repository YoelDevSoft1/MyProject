// Chakra imports
import { SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React from "react";
import Information from "views/admin/profile/components/Information";

// Assets
export default function GeneralInformation(props) {
  const { ...rest } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "unset"
  );
  return (
    <Card mb={{ base: "0px", "2xl": "20px" }} {...rest}>
      <Text
        color={textColorPrimary}
        fontWeight='bold'
        fontSize='2xl'
        mt='10px'
        mb='4px'>
        Información General SMD VITAL
      </Text>
      <Text color={textColorSecondary} fontSize='md' me='26px' mb='40px'>
        Como profesionales médicos en SMD VITAL, dedicamos nuestras vidas al cuidado 
        de la salud de nuestros pacientes. Cada día enfrentamos desafíos únicos, 
        pero nuestra pasión por la medicina y el compromiso con la excelencia 
        nos impulsan a brindar el mejor servicio médico posible...
      </Text>
      <SimpleGrid columns='2' gap='20px'>
        <Information
          boxShadow={cardShadow}
          title='Educación'
          value='Universidad Nacional de Colombia'
        />
        <Information
          boxShadow={cardShadow}
          title='Idiomas'
          value='Español, Inglés, Francés'
        />
        <Information
          boxShadow={cardShadow}
          title='Departamento'
          value='Medicina Interna SMD VITAL'
        />
        <Information
          boxShadow={cardShadow}
          title='Experiencia Laboral'
          value='Hospital San Rafael, Clínica SMD VITAL'
        />
        <Information
          boxShadow={cardShadow}
          title='Organización'
          value='SMD VITAL - Sistema Médico Digital'
        />
        <Information
          boxShadow={cardShadow}
          title='Fecha de Nacimiento'
          value='15 Marzo 1985'
        />
      </SimpleGrid>
    </Card>
  );
}
