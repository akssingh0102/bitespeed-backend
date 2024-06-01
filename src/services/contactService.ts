import prisma from '../database';
import { Contact } from '@prisma/client';

export const identifyContact = async (email?: string, phoneNumber?: string) => {
    let existingContacts: Contact[] = await prisma.contact.findMany({
        where: {
            OR: [
                { email: email ?? null },
                { phoneNumber: phoneNumber ?? null },
            ],
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    console.log(`existingContacts: ${JSON.stringify(existingContacts)}`);

    let primaryContact: Contact | null = null;
    let secondaryContacts: Contact[] = [];

    if (existingContacts.length === 0) {
        // Create a new primary contact if no existing contacts
        primaryContact = await prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkPrecedence: 'primary',
            },
        });
    } else {
        // Find the primary contact
        const primaryExistingContacts = existingContacts.filter(data => data.linkPrecedence === 'primary');
        console.log(`primaryExistingContacts: ${JSON.stringify(primaryExistingContacts)}`);
        const isMultiplePrimaryExistingContact = (primaryExistingContacts.length > 1);
        if (isMultiplePrimaryExistingContact) {

            const pk_ids = primaryExistingContacts.slice(1).map(data => data.id);
            console.log(`pk_ids: ${JSON.stringify(pk_ids)}`);

            const updatedData = await prisma.contact.updateMany({
                where: {
                    id: {
                        in: pk_ids
                    }
                },
                data: {
                    linkPrecedence: 'secondary',
                    linkedId: primaryExistingContacts[0].id
                }
            });

            const updatePrimaryKeyDependent = await prisma.contact.updateMany({
                where: {
                    linkedId: {
                        in: pk_ids
                    }
                },
                data: {
                    linkedId: primaryExistingContacts[0].id
                }
            });
            console.log(`updatedData: ${JSON.stringify(updatedData)}`);
            primaryContact = primaryExistingContacts[0]
        } else {
            primaryContact = await prisma.contact.findFirst({
                where: {

                    AND: [
                        { id: Number(existingContacts[0].linkedId) },
                        { linkPrecedence: 'primary' },
                    ],
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });
            primaryContact = primaryContact || existingContacts[0];
        }

        console.log(`primaryContact: ${JSON.stringify(primaryContact)}`);


        // Find secondary contacts
        // secondaryContacts = existingContacts.filter(c => c.id !== primaryContact!.id && c.linkPrecedence === 'secondary');
        secondaryContacts = await prisma.contact.findMany({
            where: {
                AND: [
                    { linkPrecedence: 'secondary' },
                    { linkedId: primaryContact.id },
                ],
            },
        });

        console.log(`secondaryContacts: ${JSON.stringify(secondaryContacts)}\n\n\n\n\n`);

        // Update existing contacts if necessary
        if (email && !existingContacts.find(c => (c.email === email && (c.linkedId === primaryContact?.id || c.id === primaryContact?.id))) && !isMultiplePrimaryExistingContact) {
            console.log(`Step 1`);

            const newSecondaryContact = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: 'secondary',
                    linkedId: primaryContact.id,
                },
            });
            secondaryContacts.push(newSecondaryContact);
            existingContacts.push(newSecondaryContact);
        }
        if (phoneNumber && !existingContacts.find(c => (c.phoneNumber === phoneNumber && (c.linkedId === primaryContact?.id || c.id === primaryContact?.id))) && !isMultiplePrimaryExistingContact) {
            console.log(`Step 2`);
            const newSecondaryContact = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: 'secondary',
                    linkedId: primaryContact.id,
                },
            });
            secondaryContacts.push(newSecondaryContact);
            existingContacts.push(newSecondaryContact);
        }
    }

    return formatResponse(primaryContact, secondaryContacts);
};

const formatResponse = (primaryContact: Contact, secondaryContacts: Contact[]) => {
    const emailSet = new Set([primaryContact.email, ...secondaryContacts.map(c => c.email)].filter(e => e));
    const phoneSet = new Set([primaryContact.phoneNumber, ...secondaryContacts.map(c => c.phoneNumber)].filter(p => p));

    return {
        contact: {
            primaryContactId: primaryContact.id,
            emails: Array.from(emailSet),
            phoneNumbers: Array.from(phoneSet),
            secondaryContactIds: secondaryContacts.map(c => c.id),
        },
    };
};

