import React, { useEffect, useState } from "react";

import { BiUserMinus } from "react-icons/bi";
import { database } from "../services/firebase";
import { onValue, ref, update } from "firebase/database";
import moment from "moment";

import { PopoverCustom } from "../components/_parts/PopoverCustom";
import AsideLinksEmpty from "../components/_parts/AsideLinksEmpty";
import PulsePoint from '../components/_parts/PulsePoint'
import { Divider, Box, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, FormLabel, Input, Stack, useDisclosure } from "@chakra-ui/react";

export default function RegistrarChegada() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const firstField = React.useRef() as React.MutableRefObject<HTMLInputElement>;

    const [inputToFindVisitor, setInputToFindVisitor] = useState<string>('');
    const [documentId, setDocumentId] = useState<string>('');
    const [activeVisitors, setActiveVisitors] = useState<any[]>([]);
    const [activeVisitorsFiltered, setActiveVisitorsFiltered] = useState<any[]>([]);

    function getActiveVisitors() {
        onValue(ref(database, 'visits'), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setActiveVisitors(Object.entries(data))
                setActiveVisitorsFiltered(Object.entries(data))
            }
        })
    }

    function filterActiveVisitors(input: string) {
        setInputToFindVisitor(input)
        setActiveVisitorsFiltered(activeVisitors.filter((item) => {
            const name = item[1].name.toLowerCase()
            const documentId = item[1].documentId
            return (name.includes(input.toLowerCase()) || documentId.includes(input.toLowerCase()))
        }))
    }

    function registerExit(visitId: string, visitorDocument: string) {
        update(ref(database, 'visits/' + visitId), {
            exit: moment().format(),
        })

        update(ref(database, 'visitors/' + visitorDocument), {
            isHere: false,
        })
    }

    useEffect(() => {
        getActiveVisitors()
    }, [])

    return (
        <>
            <AsideLinksEmpty title="Registrar saída" onClick={onOpen}>
                <BiUserMinus size={20} />
            </AsideLinksEmpty>
            <Drawer
                isOpen={isOpen}
                placement='right'
                initialFocusRef={firstField}
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth='1px'>
                        Registrar saída
                    </DrawerHeader>

                    <DrawerBody>
                        <Stack spacing='24px' className="overflow-hidden pb-8">
                            <Box>
                                <FormLabel htmlFor='nome'>Pesquisar</FormLabel>
                                <Input
                                    required
                                    id='nome'
                                    errorBorderColor='red.300'
                                    value={inputToFindVisitor}
                                    onChange={(event) => { filterActiveVisitors(event.target.value) }}
                                    placeholder='Digite o CPF ou nome'
                                />
                            </Box>

                            <Divider />
                            <h1 className="font-semibold text-center">Visitantes presentes</h1>
                            <Stack spacing='24px'>
                                {activeVisitorsFiltered.length == 0 ? <h3 className="text-center">Nenhum visitante encontrado</h3> : activeVisitorsFiltered.map(el => {
                                    if (el[1].exit == '') {
                                        return (
                                            <Box key={el[0]}>
                                                <Box className="relative border py-4 px-4 rounded-md text-sm">
                                                    <Box className="absolute top-1 right-1"><PulsePoint size={32} /></Box>
                                                    <p><strong>Nome:</strong> {el[1].name}</p>
                                                    <p><strong>CPF:</strong> {el[1].documentId.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
                                                    <p><strong>Chegada:</strong> {moment(el[1].entrance).format('DD/MM/YY [às] HH:mm[h]')}</p>
                                                    <p><strong>Local:</strong> {el[1].place}</p>
                                                    <Divider className="my-3" />
                                                    <Box className="flex justify-end">
                                                        <PopoverCustom
                                                            onConfirm={() => { registerExit(el[0], el[1].documentId) }}
                                                            visitName={el[1].name}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )
                                    }
                                })}
                            </Stack>
                        </Stack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}