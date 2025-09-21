"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  useGetQueueAssignmentsQuery, 
  useAssignPatientToQueueMutation,
  useCompleteQueueAssignmentMutation,
  useExpireQueueAssignmentMutation,
  useGetQueueStatsQuery
} from "@/store/queueAssignmentApi";
import { QueueStatus, QueuePriorityLevel } from "@/enums/patient.enum";
import { Clock, Users, CheckCircle, AlertTriangle, UserPlus } from "lucide-react";

interface QueueAssignmentProps {
  onAssignPatient?: (visitId: string) => void;
}

export function QueueAssignment({ onAssignPatient }: QueueAssignmentProps) {
  const [selectedPriority, setSelectedPriority] = useState<string>(QueuePriorityLevel.ROUTINE);
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  const { data: queueAssignments, isLoading, error } = useGetQueueAssignmentsQuery({
    status: QueueStatus.WAITING,
    limit: 10
  });

  const { data: queueStats } = useGetQueueStatsQuery();
  const [assignPatientToQueue] = useAssignPatientToQueueMutation();
  const [completeQueueAssignment] = useCompleteQueueAssignmentMutation();
  const [expireQueueAssignment] = useExpireQueueAssignmentMutation();

  const handleAssignPatient = async (visitId: string) => {
    try {
      await assignPatientToQueue({
        visitId,
        priority: selectedPriority,
        roomId: selectedRoom || undefined
      }).unwrap();
      
      if (onAssignPatient) {
        onAssignPatient(visitId);
      }
    } catch (error) {
      console.error('Failed to assign patient to queue:', error);
    }
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    try {
      await completeQueueAssignment(assignmentId).unwrap();
    } catch (error) {
      console.error('Failed to complete queue assignment:', error);
    }
  };

  const handleExpireAssignment = async (assignmentId: string) => {
    try {
      await expireQueueAssignment(assignmentId).unwrap();
    } catch (error) {
      console.error('Failed to expire queue assignment:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case QueuePriorityLevel.STAT:
        return "bg-red-100 text-red-800";
      case QueuePriorityLevel.URGENT:
        return "bg-yellow-100 text-yellow-800";
      case QueuePriorityLevel.ROUTINE:
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case QueueStatus.WAITING:
        return "bg-blue-100 text-blue-800";
      case QueueStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case QueueStatus.EXPIRED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Queue Assignment
          </CardTitle>
          <CardDescription>Loading queue assignments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Queue Assignment
          </CardTitle>
          <CardDescription>Error loading queue assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">
            Failed to load queue assignments
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      {queueStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Queue Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{queueStats.totalWaiting}</div>
                <div className="text-sm text-gray-600">Waiting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{queueStats.totalCompleted}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{queueStats.totalExpired}</div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{queueStats.byPriority.urgent}</div>
                <div className="text-sm text-gray-600">Urgent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Patient to Queue
          </CardTitle>
          <CardDescription>
            Configure priority and room assignment for new queue entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Priority Level</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QueuePriorityLevel.ROUTINE}>Routine</SelectItem>
                  <SelectItem value={QueuePriorityLevel.URGENT}>Urgent</SelectItem>
                  <SelectItem value={QueuePriorityLevel.STAT}>Stat/Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Room (Optional)</label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific room</SelectItem>
                  <SelectItem value="room-1">Room 1</SelectItem>
                  <SelectItem value="room-2">Room 2</SelectItem>
                  <SelectItem value="room-3">Room 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => onAssignPatient?.('sample-visit-id')}
              className="bg-primary hover:bg-primary/90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Patient
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Queue
          </CardTitle>
          <CardDescription>
            Patients currently waiting in the queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queueAssignments && queueAssignments.length > 0 ? (
            <div className="space-y-3">
              {queueAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-primary">
                      #{assignment.queueNumber}
                    </div>
                    <div>
                      <div className="font-medium">
                        {assignment.visit?.patient?.firstName} {assignment.visit?.patient?.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Patient ID: {assignment.visit?.patient?.patientCode}
                      </div>
                      <div className="text-sm text-gray-600">
                        {assignment.visit?.encounterType} - {assignment.visit?.chiefComplaint}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(assignment.priority)}>
                      {assignment.priority}
                    </Badge>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteAssignment(assignment.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExpireAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No patients currently in queue
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
