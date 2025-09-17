import React from "react";

// Chakra imports
import { Flex, useColorModeValue, Text, Box } from "@chakra-ui/react";

// Custom components
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");
  let brandColor = useColorModeValue("brand.500", "white");

  return (
    <Flex align='center' direction='column'>
      <Box my='32px'>
        <Text
          fontSize="24px"
          fontWeight="bold"
          color={brandColor}
          textAlign="center"
          letterSpacing="0.5px"
        >
          SMD VITAL
        </Text>
        <Text
          fontSize="12px"
          color={logoColor}
          textAlign="center"
          mt="-5px"
          letterSpacing="1px"
        >
          Sistema Médico Digital
        </Text>
      </Box>
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
