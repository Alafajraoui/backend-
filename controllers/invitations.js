const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Send a new invitation
const sendInvitation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if the sender exists
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
    });

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    // Check if the receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const newInvitation = await prisma.invitation.create({
      data: {
        senderId,
        receiverId,
        status: 'Pending',
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    res.status(201).json(newInvitation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while sending the invitation.' });
  }
};

// Respond to an invitation
const respondToInvitation = async (req, res) => {
  try {
    const { invitationId, status } = req.body;

    if (status !== 'Accepted' && status !== 'Declined') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status },
      include: {
        sender: true,
        receiver: true,
      },
    });

    res.status(200).json(updatedInvitation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while responding to the invitation.' });
  }
};

// Get sent invitations
const getSentInvitations = async (req, res) => {
  try {
    const { senderId } = req.params;

    const sentInvitations = await prisma.invitation.findMany({
      where: { senderId: parseInt(senderId, 10) },
      include: {
        receiver: true,
      },
    });

    res.status(200).json(sentInvitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching sent invitations.' });
  }
};

// Get received invitations
const getReceivedInvitations = async (req, res) => {
  try {
    const { receiverId } = req.params;

    const receivedInvitations = await prisma.invitation.findMany({
      where: { receiverId: parseInt(receiverId, 10) },
      include: {
        sender: true,
      },
    });

    res.status(200).json(receivedInvitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching received invitations.' });
  }
};

module.exports = {
  sendInvitation,
  respondToInvitation,
  getSentInvitations,
  getReceivedInvitations,
};