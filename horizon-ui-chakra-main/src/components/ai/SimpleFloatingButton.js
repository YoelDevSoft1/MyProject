import React, { useState } from 'react';
import {
  Box,
  Button,
  useDisclosure,
  VStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter
} from '@chakra-ui/react';
import RealAIChat from './RealAIChat';

const SimpleFloatingButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {/* Botón flotante */}
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={1000}
      >
        <VStack spacing={2}>
          <Button
            w="70px"
            h="70px"
            borderRadius="full"
            bg="blue.500"
            color="white"
            _hover={{ bg: 'blue.600', transform: 'scale(1.05)' }}
            _active={{ transform: 'scale(0.95)' }}
            onClick={onOpen}
            boxShadow="lg"
            transition="all 0.2s"
          >
            <VStack spacing={0}>
              <Text fontSize="lg">💬</Text>
              <Text fontSize="xs" fontWeight="bold">
                IA
              </Text>
            </VStack>
          </Button>
          <Text
            fontSize="xs"
            color="gray.600"
            textAlign="center"
            maxW="60px"
            lineHeight="tight"
          >
            Asistente Médico
          </Text>
        </VStack>
      </Box>

      {/* Modal del chat */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent maxW="1200px" maxH="800px" m="auto">
          <ModalHeader>
            <Text color="blue.500" fontWeight="bold">
              🤖 Asistente Médico IA - SMD VITAL
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            <RealAIChat onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SimpleFloatingButton;
